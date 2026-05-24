import { api } from "./api.js";
import { DEFAULT_HORIZON } from "./config.js";
import { createCommandMap } from "./map.js";
import { initAnalytics } from "./analytics.js";
import {
  getForecastForHorizon,
  setHorizon,
  setSelectedZone,
  setState,
  state,
  subscribe,
} from "./state.js";
import { initTimeline, initTimelinePlayer } from "./timeline.js";
import { initUI } from "./ui.js";

const mapRoot = document.querySelector("#map-root");
const timelineRoot = document.querySelector("#timeline");
const horizonControlRoot = document.querySelector("#horizon-control");

let commandMap = null;
let suppressMapSync = false;
let lastMapZones = null;
let lastMapPredictions = null;
let lastFocusedKey = null;

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
      selectedHorizon: horizon,
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
    commandMap?.updatePredictions(predictionsForHorizon);
  } catch (error) {
    setState({ apiOnline: false, error: `No se pudo actualizar +${horizon}h: ${error.message}` });
  }
}

async function main() {
  window.__deepwaveBoot = "main-started";
  initUI();
  initTimeline(timelineRoot);
  initTimeline(horizonControlRoot);
  initTimelinePlayer();
  initAnalytics();

  if (window.L) {
    commandMap = createCommandMap(mapRoot, (zoneId) => {
      setSelectedZone(zoneId);
    });
  } else {
    setState({ error: "Leaflet no esta disponible. El panel predictivo seguira funcionando sin mapa." });
  }

  subscribe((current) => {
    if (!commandMap || suppressMapSync) return;
    if (
      current.zones.length &&
      (current.zones !== lastMapZones || current.predictionsForHorizon !== lastMapPredictions)
    ) {
      commandMap.setZones(current.zones, current.predictionsForHorizon);
      lastMapZones = current.zones;
      lastMapPredictions = current.predictionsForHorizon;
    }
    commandMap?.setLayer(current.activeLayer);
    const focusKey = current.selectedZoneId
      ? `${current.selectedZoneId}:${current.selectedForecast?.horizon_hours ?? current.selectedHorizon}`
      : null;
    if (current.selectedZoneId && current.selectedForecast && focusKey !== lastFocusedKey) {
      lastFocusedKey = focusKey;
      commandMap.focusZone(current.selectedZoneId, current.selectedForecast);
    }
  });

  let lastHorizon = state.horizon;
  subscribe((current) => {
    if (current.selectedHorizon === lastHorizon) return;
    lastHorizon = current.selectedHorizon;
    suppressMapSync = true;
    refreshHorizon(current.selectedHorizon).finally(() => {
      const selectedForecast = current.selectedZoneId
        ? getForecastForHorizon(current.selectedZoneId, current.selectedHorizon)
        : null;
      setState({ selectedForecast });
      suppressMapSync = false;
      if (selectedForecast) {
        lastFocusedKey = `${current.selectedZoneId}:${selectedForecast.horizon_hours ?? current.selectedHorizon}`;
        commandMap?.focusZone(current.selectedZoneId, selectedForecast);
      }
    });
  });

  await loadAppData(DEFAULT_HORIZON);
  if (state.selectedZoneId) setHorizon(state.horizon);
}

main().catch((error) => {
  console.error(error);
  window.__deepwaveBoot = `main-error: ${error.message}`;
  setState({
    loading: false,
    apiOnline: false,
    error: `Error inicializando DeepWave: ${error.message}`,
  });
});
