import { api } from "./api.js";
import { DEFAULT_HORIZON } from "./config.js";
import { createCommandScene } from "./scene.js";
import {
  getForecastForHorizon,
  setHorizon,
  setSelectedZone,
  setState,
  state,
  subscribe,
} from "./state.js";
import { initTimeline } from "./timeline.js";
import { initUI } from "./ui.js";

const sceneRoot = document.querySelector("#scene-root");
const timelineRoot = document.querySelector("#timeline");

let commandScene = null;
let suppressSceneSync = false;
let lastSceneZones = null;
let lastScenePredictions = null;

function chooseInitialZone(zones, predictions) {
  const highestRisk = [...predictions].sort(
    (a, b) => Number(b.risk_general?.level ?? -1) - Number(a.risk_general?.level ?? -1),
  )[0];
  return highestRisk?.zona_id ?? zones[0]?.zona_id ?? null;
}

async function loadZoneForecasts(zones) {
  const entries = await Promise.all(
    zones.map(async (zone) => {
      const forecast = await api.predictZone(zone.zona_id);
      return [zone.zona_id, forecast];
    }),
  );
  return new Map(entries);
}

async function loadAppData(horizon = DEFAULT_HORIZON) {
  setState({ loading: true, error: null });
  try {
    const [health, zones, predictionsForHorizon, riskLegend, surfLegend, modelSummary] = await Promise.all([
      api.health(),
      api.zones(),
      api.predictAll(horizon),
      api.riskLegend(),
      api.surfLegend(),
      api.modelSummary(),
    ]);

    const forecastsByZone = await loadZoneForecasts(zones);
    const selectedZoneId = chooseInitialZone(zones, predictionsForHorizon);
    const selectedForecast = selectedZoneId
      ? forecastsByZone.get(selectedZoneId)?.forecast?.find((item) => Number(item.horizon_hours) === Number(horizon))
      : null;

    setState({
      apiOnline: health.status === "ok" || health.data_loaded,
      loading: false,
      error: null,
      horizon,
      zones,
      predictionsForHorizon,
      forecastsByZone,
      selectedZoneId,
      selectedForecast,
      riskLegend,
      surfLegend,
      modelSummary,
    });
  } catch (error) {
    setState({
      apiOnline: false,
      loading: false,
      error: `${error.message}. Inicia FastAPI con uvicorn src.api.main:app --reload --host 127.0.0.1 --port 8000`,
    });
  }
}

async function refreshHorizon(horizon) {
  try {
    const predictionsForHorizon = await api.predictAll(horizon);
    setState({ predictionsForHorizon, error: null, apiOnline: true });
    commandScene?.updatePredictions(predictionsForHorizon);
  } catch (error) {
    setState({ apiOnline: false, error: `No se pudo actualizar +${horizon}h: ${error.message}` });
  }
}

async function main() {
  if (!window.WebGLRenderingContext) {
    setState({ loading: false, error: "WebGL no esta disponible en este navegador." });
    return;
  }

  initUI();
  initTimeline(timelineRoot);

  commandScene = createCommandScene(sceneRoot, (zoneId) => {
    setSelectedZone(zoneId);
  });

  subscribe((current) => {
    if (!commandScene || suppressSceneSync) return;
    if (
      current.zones.length &&
      (current.zones !== lastSceneZones || current.predictionsForHorizon !== lastScenePredictions)
    ) {
      commandScene.setZones(current.zones, current.predictionsForHorizon);
      lastSceneZones = current.zones;
      lastScenePredictions = current.predictionsForHorizon;
    }
    if (current.selectedZoneId && current.selectedForecast) {
      commandScene.focusZone(current.selectedZoneId, current.selectedForecast);
    }
  });

  let lastHorizon = state.horizon;
  subscribe((current) => {
    if (current.horizon === lastHorizon) return;
    lastHorizon = current.horizon;
    suppressSceneSync = true;
    refreshHorizon(current.horizon).finally(() => {
      const selectedForecast = current.selectedZoneId
        ? getForecastForHorizon(current.selectedZoneId, current.horizon)
        : null;
      setState({ selectedForecast });
      suppressSceneSync = false;
      if (selectedForecast) commandScene?.focusZone(current.selectedZoneId, selectedForecast);
    });
  });

  await loadAppData(DEFAULT_HORIZON);
  if (state.selectedZoneId) setHorizon(state.horizon);
}

main();
