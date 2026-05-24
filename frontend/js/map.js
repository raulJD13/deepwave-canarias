const ESRI_WORLD_IMAGERY_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";

const RISK_COLORS = {
  low: "#2ecc71",
  moderate: "#f1c40f",
  high: "#e67e22",
  extreme: "#e74c3c",
  unknown: "#5be7ff",
};

const CANARY_ISLAND_LABELS = [
  { name: "El Hierro", lat: 27.74, lng: -18.02 },
  { name: "La Palma", lat: 28.68, lng: -17.86 },
  { name: "La Gomera", lat: 28.1, lng: -17.24 },
  { name: "Tenerife", lat: 28.27, lng: -16.6 },
  { name: "Gran Canaria", lat: 28.08, lng: -15.55 },
  { name: "Fuerteventura", lat: 28.36, lng: -14.05 },
  { name: "Lanzarote", lat: 29.05, lng: -13.62 },
];

const CANARY_BOUNDS = [
  [27.45, -18.25],
  [29.55, -13.25],
];

function getZoneLatLng(zone) {
  const lat = Number(zone.latitude ?? zone.lat);
  const lng = Number(zone.longitude ?? zone.lon ?? zone.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return [lat, lng];
}

function predictionForZone(predictions, zoneId) {
  return predictions.find((prediction) => prediction.zona_id === zoneId) ?? null;
}

function colorForLayer(forecast, layer) {
  const physical = forecast?.physical ?? {};
  if (layer === "wave") {
    const hs = Number(physical.hs ?? forecast?.hs ?? 0);
    if (hs >= 2.5) return "#e67e22";
    if (hs >= 1.6) return "#f1c40f";
    return "#67e8f9";
  }
  if (layer === "wind") {
    const wind = Number(physical.wind_speed ?? forecast?.wind_speed ?? 0);
    if (wind >= 10) return "#e67e22";
    if (wind >= 6) return "#f1c40f";
    return "#38bdf8";
  }
  if (layer === "surf") {
    const score = Number(forecast?.surf?.score ?? 0);
    if (score >= 8) return "#9b59b6";
    if (score >= 6) return "#2ecc71";
    if (score >= 4) return "#f1c40f";
    return "#95a5a6";
  }
  const risk = layer === "risk_navigation" ? forecast?.risk_navigation?.label : forecast?.risk_beach?.label;
  return colorForRisk(risk ?? forecast?.risk_general?.label ?? "unknown");
}

function forecastRiskLabel(forecast, layer) {
  if (layer === "risk_beach") return forecast?.risk_beach?.label ?? forecast?.risk_general?.label ?? "unknown";
  if (layer === "risk_navigation") return forecast?.risk_navigation?.label ?? forecast?.risk_general?.label ?? "unknown";
  return forecast?.risk_general?.label ?? "unknown";
}

function colorForRisk(label) {
  return RISK_COLORS[label] ?? RISK_COLORS.unknown;
}

function riskClassName(label) {
  const normalized = label && RISK_COLORS[label] ? label : "unknown";
  return `risk-${normalized}`;
}

function createBeaconIcon(forecast, selected = false, layer = "wave") {
  const risk = forecastRiskLabel(forecast, layer);
  const color = colorForLayer(forecast, layer);
  const className = ["zone-beacon", riskClassName(risk), selected ? "is-selected" : ""].filter(Boolean).join(" ");
  return L.divIcon({
    className: "",
    html: `<span class="${className}" style="color:${color}" aria-hidden="true"></span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
}

function createLabelIcon(label, className = "zone-label") {
  return L.divIcon({
    className: "",
    html: `<span class="${className}">${label}</span>`,
    iconSize: [140, 22],
    iconAnchor: [10, 12],
  });
}

function createHalo(latLng, forecast, selected = false, layer = "wave") {
  const risk = forecastRiskLabel(forecast, layer);
  const color = colorForLayer(forecast, layer);
  return L.circleMarker(latLng, {
    radius: selected ? 24 : 16,
    pane: "riskPane",
    className: `risk-halo ${riskClassName(risk)} ${selected ? "is-selected" : ""}`,
    color,
    fillColor: color,
    fillOpacity: selected ? 0.18 : 0.1,
    opacity: selected ? 0.72 : 0.42,
    weight: selected ? 2 : 1,
    interactive: false,
  });
}

function createFlowLayer() {
  const layer = L.layerGroup();
  let map = null;
  let canvas = null;
  let context = null;
  let animationFrame = null;
  let phase = 0;
  let forecast = null;
  const streamlines = [
    [[27.72, -18.05], [27.95, -17.45], [28.1, -16.75], [28.05, -16.0]],
    [[28.34, -17.95], [28.24, -17.25], [28.18, -16.56], [28.26, -15.72]],
    [[28.73, -17.75], [28.58, -16.9], [28.44, -16.08], [28.5, -15.25]],
    [[28.0, -16.9], [27.78, -16.2], [27.86, -15.42], [28.03, -14.75]],
    [[28.48, -15.2], [28.62, -14.55], [28.82, -13.92], [29.08, -13.45]],
    [[27.82, -15.55], [27.72, -14.88], [27.88, -14.2], [28.18, -13.72]],
  ];

  function ensureCanvas() {
    if (!map || canvas) return;
    canvas = L.DomUtil.create("canvas", "flow-canvas");
    context = canvas.getContext("2d");
    map.getPanes().flowPane.appendChild(canvas);
  }

  function resize() {
    if (!map || !canvas) return;
    const size = map.getSize();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = size.x * pixelRatio;
    canvas.height = size.y * pixelRatio;
    canvas.style.width = `${size.x}px`;
    canvas.style.height = `${size.y}px`;
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  }

  function drawPolyline(points, offset, alpha, color) {
    context.beginPath();
    points.forEach(([lat, lng], index) => {
      const point = map.latLngToContainerPoint([lat, lng]);
      const y = point.y + Math.sin(phase * 0.018 + index + offset) * 3;
      if (index === 0) context.moveTo(point.x, y);
      else context.lineTo(point.x, y);
    });
    context.strokeStyle = color;
    context.globalAlpha = alpha;
    context.lineWidth = 1;
    context.setLineDash([6, 14]);
    context.lineDashOffset = -phase * 0.35 - offset;
    context.stroke();
  }

  function draw() {
    if (!map || !canvas || !context) return;
    const size = map.getSize();
    context.clearRect(0, 0, size.x, size.y);
    const physical = forecast?.physical ?? {};
    const wind = Number(physical.wind_speed ?? forecast?.wind_speed ?? 4);
    const hs = Number(physical.hs ?? forecast?.hs ?? 1.2);
    const alpha = Math.min(0.5, 0.18 + hs * 0.08);
    const speed = Number.isFinite(wind) ? Math.max(0.6, Math.min(wind, 16)) : 4;
    phase += speed * 0.035;

    streamlines.forEach((line, index) => {
      drawPolyline(line, index * 18, alpha, "rgba(223, 249, 255, 0.82)");
    });

    context.setLineDash([]);
    animationFrame = requestAnimationFrame(draw);
  }

  layer.onAdd = (leafletMap) => {
    map = leafletMap;
    map.createPane("flowPane");
    map.getPane("flowPane").style.zIndex = 420;
    map.getPane("flowPane").style.pointerEvents = "none";
    ensureCanvas();
    resize();
    map.on("resize zoom move", resize);
    draw();
  };

  layer.onRemove = () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    map?.off("resize zoom move", resize);
    canvas?.remove();
    map = null;
    canvas = null;
    context = null;
  };

  layer.update = (nextForecast) => {
    forecast = nextForecast;
  };

  return layer;
}

export function createCommandMap(root, onZoneSelect) {
  const map = L.map(root, {
    center: [28.36, -15.8],
    zoom: 8,
    minZoom: 7,
    maxZoom: 13,
    zoomControl: false,
    attributionControl: false,
    preferCanvas: true,
  });

  L.tileLayer(ESRI_WORLD_IMAGERY_URL, {
    maxZoom: 19,
    crossOrigin: true,
  }).addTo(map);

  map.createPane("riskPane");
  map.getPane("riskPane").style.zIndex = 510;
  map.getPane("riskPane").style.pointerEvents = "none";

  const markerLayer = L.layerGroup().addTo(map);
  const labelLayer = L.layerGroup().addTo(map);
  const haloLayer = L.layerGroup().addTo(map);
  const flowLayer = createFlowLayer().addTo(map);
  const markerMap = new Map();
  const haloMap = new Map();
  let zonesCache = [];
  let predictionsCache = [];
  let selectedZoneId = null;
  let didFitInitialBounds = false;
  let activeLayer = "wave";

  CANARY_ISLAND_LABELS.forEach((island) => {
    L.marker([island.lat, island.lng], {
      icon: createLabelIcon(island.name, "island-label"),
      interactive: false,
    }).addTo(labelLayer);
  });

  function renderMarkers() {
    markerLayer.clearLayers();
    labelLayer.clearLayers();
    haloLayer.clearLayers();
    markerMap.clear();
    haloMap.clear();

    CANARY_ISLAND_LABELS.forEach((island) => {
      L.marker([island.lat, island.lng], {
        icon: createLabelIcon(island.name, "island-label"),
        interactive: false,
      }).addTo(labelLayer);
    });

    zonesCache.forEach((zone) => {
      const latLng = getZoneLatLng(zone);
      if (!latLng) return;
      const forecast = predictionForZone(predictionsCache, zone.zona_id);
      const isSelected = zone.zona_id === selectedZoneId;
      const marker = L.marker(latLng, {
        icon: createBeaconIcon(forecast, isSelected, activeLayer),
        title: zone.name ?? zone.zona_id,
      }).addTo(markerLayer);
      marker.on("click", () => onZoneSelect(zone.zona_id));
      marker.bindTooltip(
        `<strong>${zone.name ?? zone.zona_id}</strong><br>+${forecast?.horizon_hours ?? ""}h · hs ${forecast?.physical?.hs ?? forecast?.hs ?? "--"} m · surf ${forecast?.surf?.score ?? "--"}/10`,
        { direction: "top", opacity: 0.92 },
      );
      markerMap.set(zone.zona_id, marker);

      const halo = createHalo(latLng, forecast, isSelected, activeLayer).addTo(haloLayer);
      haloMap.set(zone.zona_id, halo);

      L.marker([latLng[0] + 0.035, latLng[1] + 0.035], {
        icon: createLabelIcon(zone.name ?? zone.zona_id, "zone-label"),
        interactive: false,
      }).addTo(labelLayer);
    });
  }

  function setZones(zones, predictions) {
    zonesCache = zones ?? [];
    predictionsCache = predictions ?? [];
    renderMarkers();
    const bounds = zonesCache.map(getZoneLatLng).filter(Boolean);
    if (!didFitInitialBounds && bounds.length) {
      didFitInitialBounds = true;
      map.fitBounds(bounds, { padding: [60, 60], animate: false });
    }
  }

  function updatePredictions(predictions) {
    predictionsCache = predictions ?? [];
    renderMarkers();
  }

  function setLayer(layer) {
    if (activeLayer === layer) return;
    activeLayer = layer;
    renderMarkers();
  }

  function focusZone(zoneId, forecast) {
    selectedZoneId = zoneId;
    flowLayer.update(forecast);
    renderMarkers();
    const zone = zonesCache.find((item) => item.zona_id === zoneId);
    const latLng = zone ? getZoneLatLng(zone) : null;
    if (latLng) {
      const targetZoom = Math.max(map.getZoom(), 9);
      map.stop();
      map.flyTo(latLng, targetZoom, {
        animate: true,
        duration: 0.65,
      });
    }
  }

  function dispose() {
    map.remove();
  }

  return { setZones, updatePredictions, setLayer, focusZone, dispose, get selectedZoneId() { return selectedZoneId; } };
}
