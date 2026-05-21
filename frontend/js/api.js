import { API_BASE_URL } from "./config.js";

async function request(path) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${path}`);
  }

  return response.json();
}

export const api = {
  health: () => request("/health"),
  zones: () => request("/zones"),
  predictZone: (zonaId) => request(`/predict/${encodeURIComponent(zonaId)}`),
  predictAll: (horizon) => request(`/predict/all?horizon=${encodeURIComponent(horizon)}`),
  modelSummary: () => request("/model/summary"),
  riskLegend: () => request("/legends/risk"),
  surfLegend: () => request("/legends/surf"),
};

