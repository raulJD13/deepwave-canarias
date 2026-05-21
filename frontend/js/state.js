import { DEFAULT_HORIZON } from "./config.js";

const listeners = new Set();

export const state = {
  apiOnline: false,
  loading: true,
  error: null,
  horizon: DEFAULT_HORIZON,
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
  const selectedForecast = getForecastForHorizon(zoneId);
  setState({ selectedZoneId: zoneId, selectedForecast });
}

export function setHorizon(horizon) {
  const selectedForecast = state.selectedZoneId ? getForecastForHorizon(state.selectedZoneId, horizon) : null;
  setState({ horizon, selectedForecast });
}

