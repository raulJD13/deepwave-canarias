import { api } from "./api.js";
import { DEFAULT_HORIZON } from "./config.js";
import { createCommandMap } from "./map.js";
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

const mapRoot = document.querySelector("#map-root");
const timelineRoot = document.querySelector("#timeline");

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
  if (!window.L) {
    setState({ loading: false, error: "Leaflet no esta disponible. Comprueba la conexion al CDN." });
    return;
  }

  initUI();
  initTimeline(timelineRoot);

  commandMap = createCommandMap(mapRoot, (zoneId) => {
    setSelectedZone(zoneId);
  });

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
    const focusKey = current.selectedZoneId
      ? `${current.selectedZoneId}:${current.selectedForecast?.horizon_hours ?? current.horizon}`
      : null;
    if (current.selectedZoneId && current.selectedForecast && focusKey !== lastFocusedKey) {
      lastFocusedKey = focusKey;
      commandMap.focusZone(current.selectedZoneId, current.selectedForecast);
    }
  });

  let lastHorizon = state.horizon;
  subscribe((current) => {
    if (current.horizon === lastHorizon) return;
    lastHorizon = current.horizon;
    suppressMapSync = true;
    refreshHorizon(current.horizon).finally(() => {
      const selectedForecast = current.selectedZoneId
        ? getForecastForHorizon(current.selectedZoneId, current.horizon)
        : null;
      setState({ selectedForecast });
      suppressMapSync = false;
      if (selectedForecast) {
        lastFocusedKey = `${current.selectedZoneId}:${selectedForecast.horizon_hours ?? current.horizon}`;
        commandMap?.focusZone(current.selectedZoneId, selectedForecast);
      }
    });
  });

  await loadAppData(DEFAULT_HORIZON);
  if (state.selectedZoneId) setHorizon(state.horizon);
}

main();
