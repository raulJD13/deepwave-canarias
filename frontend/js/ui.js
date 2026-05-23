import { colorForRisk } from "./config.js";
import { setSelectedZone, state, subscribe } from "./state.js";

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
  const riskBeach = document.querySelector("#risk-beach");
  const riskNavigation = document.querySelector("#risk-navigation");
  const recommendation = document.querySelector("#recommendation");
  const riskLegend = document.querySelector("#risk-legend");
  const surfLegend = document.querySelector("#surf-legend");
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

  subscribe((current) => {
    app.classList.toggle("is-loading", current.loading);
    apiStatus.classList.toggle("is-online", current.apiOnline);
    apiStatus.classList.toggle("is-offline", !current.apiOnline && Boolean(current.error));
    apiStatusLabel.textContent = current.apiOnline ? "API conectada" : current.error ? "API offline" : "Conectando API";
    errorState.hidden = !current.error;
    errorMessage.textContent = current.error ?? "";

    const forecast = current.selectedForecast;
    const zone = current.zones.find((item) => item.zona_id === current.selectedZoneId);
    const physical = forecast?.physical ?? {};

    if (renderedZoneCount !== current.zones.length) {
      renderedZoneCount = current.zones.length;
      zoneSelect.innerHTML = "";
      current.zones.forEach((item) => {
        const option = document.createElement("option");
        option.value = item.zona_id;
        option.textContent = `${item.name ?? item.zona_id} · ${item.isla ?? "Canarias"}`;
        zoneSelect.append(option);
      });
    }

    zoneSelect.value = current.selectedZoneId ?? "";

    zoneName.textContent = zone?.name ?? forecast?.zone_name ?? "Sin zona seleccionada";
    zoneMeta.textContent = zone ? `${zone.isla ?? "Canarias"} · horizonte +${current.horizon}h` : "Selecciona una zona del mapa";
    chipHorizon.textContent = `Horizonte +${current.horizon}h`;
    chipZone.textContent = zone?.isla ? `${zone.isla} · ${zone.name}` : "Canarias";

    metricHs.textContent = valueOrDash(physical.hs ?? forecast?.hs, " m");
    metricPeriod.textContent = valueOrDash(physical.period ?? physical.tp ?? forecast?.period, " s");
    metricWind.textContent = valueOrDash(physical.wind_speed ?? forecast?.wind_speed, " m/s");
    metricSurf.textContent = forecast?.surf?.score !== undefined ? `${valueOrDash(forecast.surf.score)}/10` : "--";

    setRisk(riskGeneral, forecast?.risk_general);
    setRisk(riskBeach, forecast?.risk_beach);
    setRisk(riskNavigation, forecast?.risk_navigation);
    recommendation.textContent = forecast?.recommendation ?? "Sin recomendacion disponible para este horizonte.";

    renderLegend(riskLegend, current.riskLegend?.levels, "label_es");
    renderLegend(surfLegend, current.surfLegend?.quality_levels, "label_es");
  });
}
