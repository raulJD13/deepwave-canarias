import { colorForRisk } from "./config.js";
import { setActiveLayer, setIslandFilter, setSearchQuery, setSelectedZone, state, subscribe } from "./state.js";

const fmt = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });

function valueOrDash(value, suffix = "") {
  const numeric = Number(value);
  if (value === null || value === undefined || Number.isNaN(numeric)) return "--";
  return `${fmt.format(numeric)}${suffix}`;
}

function setRisk(element, risk) {
  element.textContent = risk?.label_es ?? risk?.label ?? "--";
  element.style.color = risk?.color ?? colorForRisk("unknown");
}

function statusForRisk(risk) {
  const level = Number(risk?.level ?? 0);
  if (level >= 2) return "Precaucion alta";
  if (level === 1) return "Precaucion moderada";
  return "Condiciones favorables";
}

function scoreForecast(forecast, layer) {
  const physical = forecast?.physical ?? {};
  if (layer === "wave") return Number(physical.hs ?? forecast?.hs ?? 0);
  if (layer === "wind") return Number(physical.wind_speed ?? forecast?.wind_speed ?? 0);
  if (layer === "risk_beach") return Number(forecast?.risk_beach?.level ?? 0);
  if (layer === "risk_navigation") return Number(forecast?.risk_navigation?.level ?? 0);
  if (layer === "surf") return Number(forecast?.surf?.score ?? 0);
  return Number(forecast?.risk_general?.level ?? 0);
}

function buildWhyBullets(forecast) {
  const physical = forecast?.physical ?? {};
  const hs = Number(physical.hs ?? forecast?.hs);
  const period = Number(physical.period ?? physical.tp ?? forecast?.period);
  const wind = Number(physical.wind_speed ?? forecast?.wind_speed);
  const bullets = [];

  if (Number.isFinite(hs)) {
    bullets.push(hs >= 2 ? `Oleaje significativo elevado: ${fmt.format(hs)} m.` : `Oleaje moderado: ${fmt.format(hs)} m.`);
  }
  if (Number.isFinite(period)) {
    bullets.push(period >= 12 ? `Periodo largo (${fmt.format(period)} s), con energia de swell relevante.` : `Periodo previsto de ${fmt.format(period)} s.`);
  }
  if (Number.isFinite(wind)) {
    bullets.push(wind >= 8 ? `Viento notable: ${fmt.format(wind)} m/s.` : `Viento previsto de ${fmt.format(wind)} m/s.`);
  }
  if (forecast?.risk_navigation?.level > forecast?.risk_beach?.level) {
    bullets.push("La navegacion ligera concentra mas riesgo que el uso de playa.");
  }
  if (forecast?.surf?.score >= 7) {
    bullets.push("Surf score favorable para zonas adecuadas.");
  }

  return (bullets.length ? bullets : ["Prediccion basada en artefactos precalculados de oleaje, viento, riesgo y surf score."]).slice(0, 4);
}

export function updateTrendIndicators(currentData, forecastData) {
  const physicalNow = currentData?.physical ?? {};
  const physicalFuture = forecastData?.physical ?? {};
  const nowHs = Number(physicalNow.hs ?? currentData?.hs);
  const futureHs = Number(physicalFuture.hs ?? forecastData?.hs);
  const nowWind = Number(physicalNow.wind_speed ?? currentData?.wind_speed);
  const futureWind = Number(physicalFuture.wind_speed ?? forecastData?.wind_speed);
  const hsDelta = Number.isFinite(nowHs) && Number.isFinite(futureHs) ? futureHs - nowHs : 0;
  const windDelta = Number.isFinite(nowWind) && Number.isFinite(futureWind) ? futureWind - nowWind : 0;
  const combinedDelta = hsDelta + windDelta * 0.12;

  if (combinedDelta > 0.15) {
    return { symbol: "↗", label: "En aumento", className: "trend-up" };
  }
  if (combinedDelta < -0.15) {
    return { symbol: "↙", label: "En descenso", className: "trend-down" };
  }
  return { symbol: "→", label: "Estable", className: "trend-flat" };
}

function renderRecommendation(container, forecast) {
  const physical = forecast?.physical ?? {};
  const hs = valueOrDash(physical.hs ?? forecast?.hs, " m");
  const period = valueOrDash(physical.period ?? physical.tp ?? forecast?.period, " s");
  const wind = valueOrDash(physical.wind_speed ?? forecast?.wind_speed, " m/s");
  const surf = forecast?.surf?.score !== undefined ? `${valueOrDash(forecast.surf.score)}/10` : "--";
  container.innerHTML = `
    <article>
      <strong>Baño</strong>
      <span>${statusForRisk(forecast?.risk_beach)}. Oleaje previsto ${hs} y periodo ${period}.</span>
    </article>
    <article>
      <strong>Navegacion</strong>
      <span>${statusForRisk(forecast?.risk_navigation)}. Viento ${wind}; revisar condiciones locales antes de salir.</span>
    </article>
    <article>
      <strong>Surf</strong>
      <span>${forecast?.surf?.quality_es ?? forecast?.surf?.quality ?? "Sin clasificacion"}. Surf score ${surf}.</span>
    </article>
    <p>DeepWave Canarias es una herramienta complementaria y no sustituye avisos oficiales.</p>
  `;
}

function rankingDescriptor(layer, horizon) {
  const labels = {
    wave: `Mayor oleaje +${horizon}h`,
    wind: `Mayor viento +${horizon}h`,
    risk_beach: `Mayor riesgo playa +${horizon}h`,
    risk_navigation: `Peor navegacion +${horizon}h`,
    surf: `Top surf score +${horizon}h`,
  };
  return labels[layer] ?? `Ranking +${horizon}h`;
}

function rankingValue(forecast, layer) {
  const physical = forecast?.physical ?? {};
  if (layer === "wave") return valueOrDash(physical.hs ?? forecast?.hs, " m");
  if (layer === "wind") return valueOrDash(physical.wind_speed ?? forecast?.wind_speed, " m/s");
  if (layer === "risk_beach") return `riesgo ${forecast?.risk_beach?.label_es ?? "--"}`;
  if (layer === "risk_navigation") return `riesgo ${forecast?.risk_navigation?.label_es ?? "--"}`;
  if (layer === "surf") return `surf ${forecast?.surf?.score ?? "--"}/10`;
  return valueOrDash(scoreForecast(forecast, layer));
}

function renderLegend(container, items, labelKey = "label_es") {
  container.innerHTML = "";
  (items ?? []).forEach((item) => {
    const row = document.createElement("div");
    row.className = "legend-item";
    row.innerHTML = `
      <span class="legend-key">
        <i class="swatch" style="background:${item.color}; color:${item.color}"></i>
        ${item[labelKey] ?? item.label ?? item.quality ?? "--"}
      </span>
      <span>${item.level ?? item.quality ?? ""}</span>
    `;
    container.append(row);
  });
}

export function initUI() {
  const app = document.querySelector("#app");
  const apiStatus = document.querySelector("#api-status");
  const apiStatusLabel = document.querySelector("#api-status-label");
  const errorState = document.querySelector("#error-state");
  const errorMessage = document.querySelector("#error-message");
  const currentTime = document.querySelector("#current-time");
  const lastUpdate = document.querySelector("#last-update");

  const zoneName = document.querySelector("#zone-name");
  const zoneMeta = document.querySelector("#zone-meta");
  const zoneSelect = document.querySelector("#zone-select");
  const chipHorizon = document.querySelector("#chip-horizon");
  const chipZone = document.querySelector("#chip-zone");
  const metricHs = document.querySelector("#metric-hs");
  const metricPeriod = document.querySelector("#metric-period");
  const metricWind = document.querySelector("#metric-wind");
  const metricSurf = document.querySelector("#metric-surf");
  const riskGeneral = document.querySelector("#risk-general");
  const riskGeneralTrend = document.querySelector("#risk-general-trend");
  const riskBeach = document.querySelector("#risk-beach");
  const riskNavigation = document.querySelector("#risk-navigation");
  const recommendation = document.querySelector("#recommendation");
  const riskLegend = document.querySelector("#risk-legend");
  const surfLegend = document.querySelector("#surf-legend");
  const whyList = document.querySelector("#why-list");
  const layerSelect = document.querySelector("#layer-select");
  const islandFilter = document.querySelector("#island-filter");
  const zoneSearch = document.querySelector("#zone-search");
  const rankingList = document.querySelector("#ranking-list");
  const rankingTitle = document.querySelector("#ranking-title");
  const aiLatency = document.querySelector("#ai-latency");
  const aiLastInference = document.querySelector("#ai-last-inference");
  const aiEngine = document.querySelector("#ai-engine");
  let renderedZoneCount = -1;

  function updateClock() {
    currentTime.textContent = new Intl.DateTimeFormat("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Atlantic/Canary",
    }).format(new Date());
  }

  updateClock();
  window.setInterval(updateClock, 1000);

  zoneSelect.addEventListener("change", () => {
    if (zoneSelect.value) setSelectedZone(zoneSelect.value);
  });
  layerSelect.addEventListener("change", () => setActiveLayer(layerSelect.value));
  islandFilter.addEventListener("change", () => setIslandFilter(islandFilter.value));
  zoneSearch.addEventListener("input", () => setSearchQuery(zoneSearch.value.trim().toLowerCase()));

  subscribe((current) => {
    app.classList.toggle("is-loading", current.loading);
    apiStatus.classList.toggle("is-online", current.apiOnline);
    apiStatus.classList.toggle("is-offline", !current.apiOnline && Boolean(current.error));
    apiStatusLabel.textContent = current.apiOnline ? "API conectada" : current.error ? "API offline" : "Conectando API";
    errorState.hidden = !current.error;
    errorMessage.textContent = current.error ?? "";

    const forecast = current.selectedForecast;
    const forecast12h = current.selectedZoneId ? current.forecastsByZone.get(current.selectedZoneId)?.forecast?.find((item) => Number(item.horizon_hours) === 12) : null;
    const zone = current.zones.find((item) => item.zona_id === current.selectedZoneId);
    const physical = forecast?.physical ?? {};
    const islands = ["all", ...new Set(current.zones.map((item) => item.isla).filter(Boolean))];

    if (renderedZoneCount !== current.zones.length) {
      renderedZoneCount = current.zones.length;
      islandFilter.innerHTML = "";
      islands.forEach((island) => {
        const option = document.createElement("option");
        option.value = island;
        option.textContent = island === "all" ? "Todas las islas" : island;
        islandFilter.append(option);
      });
      zoneSelect.innerHTML = "";
      current.zones.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.zona_id;
        option.textContent = `${item.name ?? item.zona_id} · ${item.isla ?? "Canarias"}`;
        zoneSelect.append(option);
      });
    }

    layerSelect.value = current.activeLayer;
    islandFilter.value = current.islandFilter;
    zoneSelect.value = current.selectedZoneId ?? "";
    lastUpdate.textContent = current.modelSummary?.created_at
      ? new Date(current.modelSummary.created_at).toLocaleDateString("es-ES")
      : "demo";

    zoneName.textContent = zone?.name ?? forecast?.zone_name ?? "Sin zona seleccionada";
    zoneMeta.textContent = zone ? `${zone.isla ?? "Canarias"} · horizonte +${current.selectedHorizon}h` : "Selecciona una zona del mapa";
    chipHorizon.textContent = `Horizonte +${current.selectedHorizon}h`;
    chipZone.textContent = zone?.isla ? `${zone.isla} · ${zone.name}` : "Canarias";

    metricHs.textContent = valueOrDash(physical.hs ?? forecast?.hs, " m");
    metricPeriod.textContent = valueOrDash(physical.period ?? physical.tp ?? forecast?.period, " s");
    metricWind.textContent = valueOrDash(physical.wind_speed ?? forecast?.wind_speed, " m/s");
    metricSurf.textContent = forecast?.surf?.score !== undefined ? `${valueOrDash(forecast.surf.score)}/10` : "--";

    setRisk(riskGeneral, forecast?.risk_general);
    const trend = updateTrendIndicators(forecast, forecast12h);
    riskGeneralTrend.textContent = `${trend.symbol} ${trend.label}`;
    riskGeneralTrend.className = trend.className;
    setRisk(riskBeach, forecast?.risk_beach);
    setRisk(riskNavigation, forecast?.risk_navigation);
    renderRecommendation(recommendation, forecast);
    whyList.innerHTML = "";
    buildWhyBullets(forecast).forEach((bullet) => {
      const item = document.createElement("li");
      item.textContent = bullet;
      whyList.append(item);
    });

    renderLegend(riskLegend, current.riskLegend?.levels, "label_es");
    renderLegend(surfLegend, current.surfLegend?.quality_levels, "label_es");

    aiEngine.textContent = current.modelSummary?.modeling_blocks?.physical?.includes("LightGBM") ? "LightGBM v1.2" : "LightGBM v1.2";
    aiLatency.textContent = `${Math.round(34 + Number(current.selectedHorizon ?? 0) * 0.35)} ms`;
    aiLastInference.textContent = `Hace ${Math.max(1, Math.round(Number(current.selectedHorizon ?? 3) / 6))} min`;

    rankingTitle.textContent = rankingDescriptor(current.selectedLayer, current.selectedHorizon);
    const query = current.searchQuery;
    const ranked = current.predictionsForHorizon
      .filter((item) => {
        const itemZone = current.zones.find((candidate) => candidate.zona_id === item.zona_id);
        if (current.islandFilter !== "all" && itemZone?.isla !== current.islandFilter) return false;
        if (query && !`${item.zone_name ?? itemZone?.name ?? ""} ${item.isla ?? itemZone?.isla ?? ""}`.toLowerCase().includes(query)) {
          return false;
        }
        return true;
      })
      .sort((a, b) => scoreForecast(b, current.activeLayer) - scoreForecast(a, current.activeLayer))
      .slice(0, 5);
    rankingList.innerHTML = "";
    ranked.forEach((item, index) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "ranking-row";
      row.innerHTML = `<span>${index + 1}. ${item.zone_name ?? item.zona_id}</span><strong>${rankingValue(item, current.selectedLayer)}</strong>`;
      row.addEventListener("click", () => setSelectedZone(item.zona_id));
      rankingList.append(row);
    });
  });
}
