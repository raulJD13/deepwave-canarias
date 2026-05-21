# DeepWave Canarias — Ocean Command Center Frontend Specification

## Goal

Build a premium lightweight frontend for DeepWave Canarias using HTML, CSS, vanilla JavaScript ES modules and Three.js.

The frontend must visualize maritime predictions served by the FastAPI backend and feel like a professional maritime intelligence dashboard, closer to Copernicus Marine, Windy or NOAA-style operational monitoring than to an abstract game scene.

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
    ├── scene.js
    ├── ocean.js
    ├── oceanLayers.js
    ├── islands.js
    ├── markers.js
    ├── particles.js
    ├── surfMedallion.js
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
- Central Three.js scene with a stylized 3D map of the Canary Islands.
- Animated dark Atlantic ocean surface.
- Oceanographic overlays for swell, wind and coastal risk.
- Discreet coastal beacons/buoys for monitored zones.
- Right-side command panel with selected-zone forecast values.
- Bottom horizon timeline: +3h, +6h, +12h, +24h and +48h.
- Safety disclaimer.
- Loading, error and WebGL fallback states.

## Ocean Layer

The ocean must look like deep Atlantic water, not lava or an arcade surface.

Rules:

- Base color: dark blue/near-black ocean.
- Secondary color: cyan/teal for crests and reflections.
- `hs` controls wave amplitude.
- `period` controls wavelength/frequency.
- `wind_speed` controls small turbulence/chop.
- Higher risk can add localized foam/spray but must not tint the whole sea red or orange.

## Island Layer

Canary Islands should be stylized but credible.

Rules:

- Low volcanic relief.
- Organic island shapes, not perfect cylinders.
- Dark matte volcanic material.
- Subtle cyan coastline outline.
- Approximate lat/lon projection is acceptable for this MVP.
- No real DEM or GeoJSON is required for the first production demo.

## Marker Layer

Zones should appear as monitoring sensors or coastal buoys.

Rules:

- Avoid large arcade rings.
- Use small beacons/buoys with a subtle halo on the sea surface.
- Risk color mapping:
  - low: green
  - moderate: amber
  - high: orange/red
  - extreme: red
- Clicking a marker selects the zone and updates UI, scene focus and oceanographic layers.
- A zone selector in the panel should provide a clear non-3D way to change zone.

## Oceanographic Layers

Use lightweight visual overlays:

- wind vectors/fine arrows
- swell bands/lines
- optional current lines when data is available or as a subtle contextual layer
- localized risk foam/spray around the selected zone

These layers must update when the selected zone or horizon changes.

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

- dark technical ocean theme
- moderated glassmorphism
- subtle borders and glows
- clear typography
- professional contrast
- responsive layout

## Fallbacks

If API is offline:

- show clear error
- keep UI visible
- do not invent production data unless a temporary static fallback is explicitly implemented

If WebGL is unavailable:

- show a clear message that WebGL is required for the 3D scene
- keep basic UI messaging visible

## Performance Constraints

Keep it lightweight:

- no large textures
- no heavy 3D models
- no real-time physics
- no unnecessary postprocessing
- smooth enough for live project presentation

## Acceptance Criteria

The frontend is complete when:

- opening `frontend/index.html` or serving `frontend/` starts the UI
- Three.js scene renders without errors
- ocean animates as a dark Atlantic surface
- islands appear as low organic volcanic masses
- monitored zones appear as beacons/buoys
- API status works
- selecting a zone updates the command panel and scene
- selecting a horizon updates data and visual layers
- wind/swell/risk layers are visible and understandable
- UI is responsive
- no console errors in normal operation
