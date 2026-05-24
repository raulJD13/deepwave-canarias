import { HORIZONS } from "./config.js";
import { destroyChart, renderPredictiveChart } from "./charts.js";
import { setHorizon, setSelectedZone, state, subscribe } from "./state.js";

const fmt = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });
let activeChart = "wave";

function valueOrDash(value, suffix = "") {
  const numeric = Number(value);
  if (value === null || value === undefined || Number.isNaN(numeric)) return "--";
  return `${fmt.format(numeric)}${suffix}`;
}

function zoneForecasts(current) {
  return current.forecastsByZone.get(current.selectedZoneId)?.forecast ?? [];
}

function riskLevel(forecast, key) {
  return Number(forecast?.[key]?.level ?? 0);
}

function topBy(predictions, getter, direction = "desc") {
  return [...predictions]
    .sort((a, b) => (direction === "asc" ? getter(a) - getter(b) : getter(b) - getter(a)))
    .slice(0, 4);
}

function renderEvolution(container, current) {
  const forecasts = zoneForecasts(current);
  container.innerHTML = "";
  HORIZONS.forEach((horizon) => {
    const forecast = forecasts.find((item) => Number(item.horizon_hours) === Number(horizon));
    const physical = forecast?.physical ?? {};
    const card = document.createElement("article");
    card.className = `evolution-card ${Number(current.selectedHorizon) === Number(horizon) ? "is-active" : ""}`;
    card.type = "button";
    card.dataset.horizon = horizon;
    card.innerHTML = `
      <strong>+${horizon}h</strong>
      <span>Ola ${valueOrDash(physical.hs ?? forecast?.hs, " m")}</span>
      <span>Periodo ${valueOrDash(physical.period ?? physical.tp ?? forecast?.period, " s")}</span>
      <span>Viento ${valueOrDash(physical.wind_speed ?? forecast?.wind_speed, " m/s")}</span>
      <span>Playa ${forecast?.risk_beach?.label_es ?? "--"}</span>
      <span>Navegacion ${forecast?.risk_navigation?.label_es ?? "--"}</span>
      <span>Surf ${forecast?.surf?.score !== undefined ? `${valueOrDash(forecast.surf.score)}/10` : "--"}</span>
    `;
    container.append(card);
  });
}

function renderChart(canvas, emptyPanel, modelPanel, current) {
  const showModel = activeChart === "model";
  canvas.hidden = showModel;
  emptyPanel.hidden = true;
  modelPanel.hidden = !showModel;
  if (showModel) {
    destroyChart();
    const metrics = current.modelSummary?.metrics_highlights ?? {};
    modelPanel.innerHTML = `
      <div><span>Modelo fisico</span><strong>LightGBM</strong></div>
      <div><span>Zonas</span><strong>${current.modelSummary?.zones_count ?? current.zones.length}</strong></div>
      <div><span>Predicciones</span><strong>${current.modelSummary?.predictions_count ?? current.predictionsForHorizon.length}</strong></div>
      <div><span>Horizontes</span><strong>${(current.modelSummary?.horizons_hours ?? HORIZONS).join(", ")}h</strong></div>
      <div><span>MAE hs +24h</span><strong>${metrics.hs_mae_24h ?? "--"} m</strong></div>
      <div><span>MAE hs +48h</span><strong>${metrics.hs_mae_48h ?? "--"} m</strong></div>
      <div><span>API</span><strong>${current.apiOnline ? "online" : "offline"}</strong></div>
      <div><span>Origen</span><strong>app_data / FastAPI</strong></div>
      <div><span>Update</span><strong>${current.modelSummary?.created_at ? new Date(current.modelSummary.created_at).toLocaleDateString("es-ES") : "demo"}</strong></div>
    `;
    return;
  }
  renderPredictiveChart(activeChart, canvas, emptyPanel, current);
}

function renderComparison(container, current) {
  const safest = topBy(current.predictionsForHorizon, (f) => riskLevel(f, "risk_beach"), "asc");
  const surf = topBy(current.predictionsForHorizon, (f) => Number(f.surf?.score ?? 0));
  const risk = topBy(current.predictionsForHorizon, (f) => Number(f.risk_general?.level ?? 0));
  const navigation = topBy(current.predictionsForHorizon, (f) => riskLevel(f, "risk_navigation"));
  const groups = [
    ["Zonas mas seguras", safest],
    ["Mejor surf", surf],
    ["Mayor riesgo", risk],
    ["Peor navegacion", navigation],
  ];
  container.innerHTML = groups
    .map(
      ([title, rows]) => `
        <section>
          <strong>${title}</strong>
          ${rows.map((item) => `<button type="button" data-zone="${item.zona_id}"><span>${item.zone_name ?? item.zona_id}</span><em>${item.risk_general?.label_es ?? `surf ${item.surf?.score ?? "--"}`}</em></button>`).join("")}
        </section>
      `,
    )
    .join("");
}

export function initAnalytics() {
  const evolution = document.querySelector("#forecast-evolution");
  const title = document.querySelector("#evolution-title");
  const summary = document.querySelector("#dock-summary");
  const canvas = document.querySelector("#forecast-chart");
  const emptyPanel = document.querySelector("#chart-empty");
  const modelPanel = document.querySelector("#model-panel");
  const comparison = document.querySelector("#comparison-table");
  const tabs = document.querySelector("#chart-tabs");

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-chart]");
    if (!button) return;
    activeChart = button.dataset.chart;
    tabs.querySelectorAll(".chart-tab").forEach((tab) => tab.classList.toggle("is-active", tab === button));
    renderChart(canvas, emptyPanel, modelPanel, state);
  });
  comparison.addEventListener("click", (event) => {
    const button = event.target.closest("[data-zone]");
    if (button?.dataset.zone) setSelectedZone(button.dataset.zone);
  });
  evolution.addEventListener("click", (event) => {
    const card = event.target.closest("[data-horizon]");
    if (card?.dataset.horizon) setHorizon(Number(card.dataset.horizon));
  });

  subscribe((current) => {
    const zone = current.zones.find((item) => item.zona_id === current.selectedZoneId);
    title.textContent = zone ? `${zone.name} · prediccion +48h` : "Prediccion temporal";
    summary.textContent = `Horizonte activo +${current.selectedHorizon}h · capa ${current.selectedLayer}`;
    renderEvolution(evolution, current);
    renderChart(canvas, emptyPanel, modelPanel, current);
    renderComparison(comparison, current);
  });
}
