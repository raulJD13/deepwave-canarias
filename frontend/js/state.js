import { DEFAULT_HORIZON } from "./config.js";

const listeners = new Set();

export const state = {
  apiOnline: false,
  loading: true,
  error: null,
  horizon: DEFAULT_HORIZON,
  selectedHorizon: DEFAULT_HORIZON,
  activeLayer: "wave",
  selectedLayer: "wave",
  selectedProfile: "operational",
  islandFilter: "all",
  searchQuery: "",
  zones: [],
  forecastsByZone: new Map(),
  predictionsForHorizon: [],
  selectedZoneId: null,
  selectedForecast: null,
  riskLegend: null,
  surfLegend: null,
  modelSummary: null,
};

export function subscribe(listener) {
  listeners.add(listener);
  listener(state);
  return () => listeners.delete(listener);
}

export function setState(patch) {
  Object.assign(state, patch);
  listeners.forEach((listener) => listener(state));
}

export function getForecastForHorizon(zoneId, horizon = state.horizon) {
  const entry = state.forecastsByZone.get(zoneId);
  const forecast = entry?.forecast ?? [];
  return forecast.find((item) => Number(item.horizon_hours) === Number(horizon)) ?? null;
}

export function setSelectedZone(zoneId) {
  const selectedForecast = getForecastForHorizon(zoneId, state.selectedHorizon);
  setState({ selectedZoneId: zoneId, selectedForecast });
}

export function setHorizon(horizon) {
  const selectedForecast = state.selectedZoneId ? getForecastForHorizon(state.selectedZoneId, horizon) : null;
  setState({ horizon, selectedHorizon: horizon, selectedForecast });
}

export function setActiveLayer(activeLayer) {
  setState({ activeLayer, selectedLayer: activeLayer });
}

export function setIslandFilter(islandFilter) {
  setState({ islandFilter });
}

export function setSearchQuery(searchQuery) {
  setState({ searchQuery });
}
