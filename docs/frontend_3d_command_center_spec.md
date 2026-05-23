# DeepWave Canarias - Ocean Command Center Frontend Specification

## Goal

Build a premium lightweight frontend for DeepWave Canarias using HTML, CSS, vanilla JavaScript ES modules and Leaflet.js.

The frontend must visualize maritime predictions served by the FastAPI backend and feel like a professional maritime intelligence dashboard, closer to Copernicus Marine, Windy or NOAA-style operational monitoring than to a game scene.

No React. No Vue. No Vite. No heavy frontend framework.

## Expected folder structure

```text
frontend/
├── index.html
├── styles.css
└── js/
    ├── app.js
    ├── config.js
    ├── api.js
    ├── state.js
    ├── map.js
    ├── timeline.js
    └── ui.js
```

## API endpoints expected

The frontend expects the backend at:

```text
http://127.0.0.1:8000
```

Required endpoints:

```text
GET /health
GET /zones
GET /predict/{zona_id}
GET /predict/{zona_id}?horizon=24
GET /predict/all?horizon=24
GET /risk/{zona_id}
GET /surf/{zona_id}
GET /model/summary
GET /legends/risk
GET /legends/surf
```

## Visual Concept

The application is an **Ocean Command Center** for the Canary Islands.

Main components:

- Compact top operations bar with system name, API status, local time and mode.
- Central Leaflet satellite map with Esri World Imagery.
- Animated maritime flow overlay for wind, swell and current-like motion.
- Discreet coastal beacons for monitored zones.
- Neon risk halos around selected or relevant zones.
- Right-side command panel with selected-zone forecast values.
- Bottom horizon timeline: +3h, +6h, +12h, +24h and +48h.
- Safety disclaimer.
- Loading and API error states.

## Map Layer

The map must look like a real maritime operations surface.

Rules:

- Use Esri World Imagery tiles:
  `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}`.
- Fit the Canary Islands by default.
- Hide coarse Leaflet controls unless explicitly needed.
- Use color correction through CSS filters to make the satellite imagery fit the dark command-center UI.
- Avoid heavy map plugins.

## Marker Layer

Zones should appear as monitoring sensors or coastal beacons.

Rules:

- Use small beacons with a subtle halo on the map.
- Risk color mapping:
  - low: green
  - moderate: amber
  - high: orange/red
  - extreme: red
- Clicking a marker selects the zone and updates UI, map focus and oceanographic layers.
- A zone selector in the panel should provide a clear non-map way to change zone.

## Oceanographic Flow Layer

Use a lightweight canvas overlay:

- fine dashed streamlines
- low opacity
- subtle animation
- speed influenced by `wind_speed` when available
- intensity influenced by `hs`

The layer must update when the selected zone or horizon changes.

## UI Overlay

The UI should feel like a serious operations dashboard.

Required elements:

- compact header with:
  - system name
  - API status
  - local Canary Islands time
  - operating mode
- selected-zone panel with:
  - zone name
  - island
  - active horizon
  - wave height
  - period
  - wind speed
  - surf score
  - general risk
  - beach risk
  - navigation risk
  - recommendation
- horizon timeline
- risk legend
- surf legend
- safety disclaimer

CSS direction:

- cyber-oceanic dark theme
- glassmorphism panels
- subtle borders and glows
- satellite map background
- clear typography
- professional contrast
- responsive layout

## Fallbacks

If API is offline:

- show clear error
- keep UI visible
- do not invent production data unless a temporary static fallback is explicitly implemented

If Leaflet CDN is unavailable:

- show a clear message that the map library is unavailable
- keep basic UI messaging visible

## Performance Constraints

Keep it lightweight:

- no large local textures
- no heavy map plugins
- no real-time physics
- no unnecessary postprocessing
- smooth enough for live project presentation

## Acceptance Criteria

The frontend is complete when:

- serving `frontend/` starts the UI
- Leaflet map renders without errors
- Esri satellite imagery appears
- monitored zones appear as beacons
- selected risk halo/glow is visible
- animated flow overlay is visible but subtle
- API status works
- selecting a zone updates the command panel and map
- selecting a horizon updates data and visual layers
- UI is responsive
- no console errors in normal operation
