export const API_BASE_URL = "http://127.0.0.1:8000";

export const HORIZONS = [3, 6, 12, 24, 48];
export const DEFAULT_HORIZON = 24;

export const RISK_COLORS = {
  low: "#2ecc71",
  moderate: "#f1c40f",
  high: "#e67e22",
  extreme: "#e74c3c",
  unknown: "#5be7ff",
};

export const SURF_COLORS = {
  poor: "#95a5a6",
  fair: "#f1c40f",
  good: "#2ecc71",
  very_good: "#3498db",
  epic: "#9b59b6",
  unknown: "#5be7ff",
};

export const ISLANDS = [
  { name: "El Hierro", lat: 27.74, lon: -18.02, radius: 2.6, scale: [1.1, 0.72], rotation: -0.2 },
  { name: "La Palma", lat: 28.68, lon: -17.86, radius: 3.2, scale: [0.76, 1.25], rotation: 0.28 },
  { name: "La Gomera", lat: 28.1, lon: -17.24, radius: 2.5, scale: [1, 0.82], rotation: 0.1 },
  { name: "Tenerife", lat: 28.27, lon: -16.6, radius: 4.8, scale: [1.42, 0.8], rotation: -0.1 },
  { name: "Gran Canaria", lat: 28.08, lon: -15.55, radius: 3.9, scale: [1.0, 0.92], rotation: 0.18 },
  { name: "Fuerteventura", lat: 28.36, lon: -14.05, radius: 5.2, scale: [0.78, 1.75], rotation: -0.52 },
  { name: "Lanzarote", lat: 29.05, lon: -13.62, radius: 3.7, scale: [0.75, 1.28], rotation: -0.5 },
  { name: "Alegranza", lat: 29.4, lon: -13.5, radius: 1.3, scale: [0.9, 0.65], rotation: 0.2 },
];

export const MAP_BOUNDS = {
  minLat: 27.45,
  maxLat: 29.55,
  minLon: -18.25,
  maxLon: -13.25,
};

export function projectLatLon(lat, lon) {
  const x = ((lon - MAP_BOUNDS.minLon) / (MAP_BOUNDS.maxLon - MAP_BOUNDS.minLon) - 0.5) * 92;
  const z = -((lat - MAP_BOUNDS.minLat) / (MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat) - 0.5) * 48;
  return { x, z };
}

export function colorForRisk(label) {
  return RISK_COLORS[label] ?? RISK_COLORS.unknown;
}

export function colorForSurf(quality) {
  return SURF_COLORS[quality] ?? SURF_COLORS.unknown;
}

