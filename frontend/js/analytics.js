import { HORIZONS } from "./config.js";
import { destroyChart, renderPredictiveChart } from "./charts.js";
import { setHorizon, setSelectedZone, state, subscribe } from "./state.js";

const fmt = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 1 });
const metricFmt = new Intl.NumberFormat("es-ES", { maximumFractionDigits: 3 });
let activeChart = "wave";

const VALIDATION_METRICS = {
  hsRmse24h: 0.3865,
  hsRmse48h: 0.5392,
  surfRmse24h: 1.8454,
  surfF124h: 0.426,
  riskGeneralF124h: 0.6201,
  riskGeneralRecallHigh24h: 0.5339,
  riskNavigationF124h: 0.6011,
  riskNavigationRecallHigh24h: 0.3736,
  apiLocalMeanMs: 0.9419,
  apiLocalP95Ms: 1.2742,
  apiServerMeanMs: 1.5352,
  apiServerP95Ms: 2.374,
};

function valueOrDash(value, suffix = "") {
  const numeric = Number(value);
  if (value === null || value === undefined || Number.isNaN(numeric)) return "--";
  return `${fmt.format(numeric)}${suffix}`;
}

function metricOrDash(value, suffix = "") {
  const numeric = Number(value);
  if (value === null || value === undefined || Number.isNaN(numeric)) return "--";
  return `${metricFmt.format(numeric)}${suffix}`;
}

function metricCard(label, value, detail = "", modifier = "") {
  return `
    <div class="model-metric ${modifier}">
      <span>${label}</span>
      <strong>${value}</strong>
      ${detail ? `<small>${detail}</small>` : ""}
    </div>
  `;
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
    const horizons = current.modelSummary?.horizons_hours ?? HORIZONS;
    modelPanel.innerHTML = `
      ${metricCard("Modelo fisico", "LightGBM", "Regresores por variable y horizonte", "is-system")}
      ${metricCard("Zonas", current.modelSummary?.zones_count ?? current.zones.length, "zonas costeras monitorizadas")}
      ${metricCard("Predicciones", current.modelSummary?.predictions_count ?? current.predictionsForHorizon.length, "artefactos servidos desde app_data")}
      ${metricCard("Horizontes", `+${horizons.join("h, +")}h`, "ventana predictiva")}
      ${metricCard("MAE hs +24h", metricOrDash(metrics.hs_mae_24h, " m"), "error medio absoluto de ola", "is-highlight")}
      ${metricCard("RMSE hs +24h", metricOrDash(VALIDATION_METRICS.hsRmse24h, " m"), "validacion LightGBM hs", "is-highlight")}
      ${metricCard("MAE hs +48h", metricOrDash(metrics.hs_mae_48h, " m"), "error a largo plazo", "is-highlight")}
      ${metricCard("RMSE hs +48h", metricOrDash(VALIDATION_METRICS.hsRmse48h, " m"), "incertidumbre ampliada", "is-highlight")}
      ${metricCard("F1 riesgo general +24h", metricOrDash(VALIDATION_METRICS.riskGeneralF124h), "macro F1 recomendado", "is-risk")}
      ${metricCard("Recall riesgo alto +24h", metricOrDash(VALIDATION_METRICS.riskGeneralRecallHigh24h), "clase alto / riesgo general", "is-risk")}
      ${metricCard("F1 navegacion +24h", metricOrDash(VALIDATION_METRICS.riskNavigationF124h), "macro F1 operativo", "is-risk")}
      ${metricCard("Recall alto navegacion", metricOrDash(VALIDATION_METRICS.riskNavigationRecallHigh24h), "clase alto / navegacion", "is-risk")}
      ${metricCard("MAE surf +24h", metricOrDash(metrics.surf_score_mae_24h, " pt"), "surf score 0-10", "is-surf")}
      ${metricCard("RMSE surf +24h", metricOrDash(VALIDATION_METRICS.surfRmse24h, " pt"), "PhysicalDerivedSurfScore", "is-surf")}
      ${metricCard("F1 calidad surf +24h", metricOrDash(VALIDATION_METRICS.surfF124h), "macro F1 por calidad", "is-surf")}
      ${metricCard("API media local", metricOrDash(VALIDATION_METRICS.apiLocalMeanMs, " ms"), "benchmark Mac M2 Pro", "is-api")}
      ${metricCard("API p95 local", metricOrDash(VALIDATION_METRICS.apiLocalP95Ms, " ms"), "percentil 95 endpoint suite", "is-api")}
      ${metricCard("API media servidor", metricOrDash(VALIDATION_METRICS.apiServerMeanMs, " ms"), "benchmark IsardVDI", "is-api")}
      ${metricCard("API p95 servidor", metricOrDash(VALIDATION_METRICS.apiServerP95Ms, " ms"), "percentil 95 IsardVDI", "is-api")}
      ${metricCard("Estado API", current.apiOnline ? "online" : "offline", "FastAPI /health", current.apiOnline ? "is-api" : "is-muted")}
      ${metricCard("Origen", "app_data / FastAPI", "sin cargar modelos pesados")}
      ${metricCard("Ultimo update", current.modelSummary?.created_at ? new Date(current.modelSummary.created_at).toLocaleDateString("es-ES") : "demo", "artefactos de produccion")}
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
