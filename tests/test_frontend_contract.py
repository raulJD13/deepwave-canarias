from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
FRONTEND = ROOT / "frontend"


EXPECTED_FRONTEND_FILES = [
    "index.html",
    "styles.css",
    "js/app.js",
    "js/config.js",
    "js/api.js",
    "js/state.js",
    "js/analytics.js",
    "js/charts.js",
    "js/map.js",
    "js/timeline.js",
    "js/ui.js",
]


def read_frontend_file(relative_path: str) -> str:
    return (FRONTEND / relative_path).read_text(encoding="utf-8")


def test_frontend_expected_files_exist() -> None:
    missing = [path for path in EXPECTED_FRONTEND_FILES if not (FRONTEND / path).is_file()]
    assert missing == []


def test_index_html_wires_ocean_command_center_shell() -> None:
    html = read_frontend_file("index.html")

    required_fragments = [
        "DeepWave Canarias Ocean Command Center",
        'id="map-root"',
        'id="api-status"',
        'id="current-time"',
        'id="zone-select"',
        'id="timeline"',
        'type="module"',
        "leaflet@1.9.4",
        "chart.js",
        "chartjs-plugin-annotation",
        'id="btn-play-timeline"',
        'id="ai-latency"',
        "Herramienta complementaria",
    ]

    for fragment in required_fragments:
        assert fragment in html


def test_frontend_api_client_targets_fastapi_contract() -> None:
    api_js = read_frontend_file("js/api.js")
    config_js = read_frontend_file("js/config.js")

    assert 'API_BASE_URL = "http://127.0.0.1:8000"' in config_js
    assert "World_Imagery/MapServer/tile/{z}/{y}/{x}" in config_js
    assert "HORIZONS = [3, 6, 12, 24, 48]" in config_js

    for endpoint_fragment in [
        "/health",
        "/zones",
        "/predict/",
        "/predict/all?horizon=",
        "/model/summary",
        "/legends/risk",
        "/legends/surf",
    ]:
        assert endpoint_fragment in api_js


def test_frontend_map_keeps_modular_leaflet_layers() -> None:
    map_js = read_frontend_file("js/map.js")

    required_fragments = [
        "L.map",
        "L.tileLayer",
        "ESRI_WORLD_IMAGERY_URL",
        "createFlowLayer",
        "createBeaconIcon",
        "createHalo",
    ]

    for fragment in required_fragments:
        assert fragment in map_js

    assert "export function createCommandMap" in map_js


def test_oceanographic_visual_classes_are_available() -> None:
    styles = read_frontend_file("styles.css")

    for class_name in [".flow-canvas", ".zone-beacon", ".risk-halo", ".risk-low", ".risk-moderate", ".risk-high"]:
        assert class_name in styles


def test_frontend_model_api_tab_exposes_validation_metrics() -> None:
    analytics_js = read_frontend_file("js/analytics.js")

    required_metrics = [
        "MAE hs +24h",
        "RMSE hs +24h",
        "MAE hs +48h",
        "RMSE hs +48h",
        "F1 riesgo general +24h",
        "Recall riesgo alto +24h",
        "MAE surf +24h",
        "RMSE surf +24h",
        "API media local",
        "API p95 servidor",
    ]

    for metric in required_metrics:
        assert metric in analytics_js


def test_frontend_avoids_heavy_frameworks() -> None:
    combined_frontend = "\n".join(
        path.read_text(encoding="utf-8")
        for path in [FRONTEND / "index.html", FRONTEND / "styles.css", *sorted((FRONTEND / "js").glob("*.js"))]
    )

    forbidden_fragments = ["React", "Vue", "Angular", "Vite", "three.module.js"]
    for fragment in forbidden_fragments:
        assert fragment not in combined_frontend
