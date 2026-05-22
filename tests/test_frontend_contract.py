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
    "js/scene.js",
    "js/ocean.js",
    "js/islands.js",
    "js/markers.js",
    "js/particles.js",
    "js/surfMedallion.js",
    "js/timeline.js",
    "js/ui.js",
    "js/oceanLayers.js",
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
        'id="scene-root"',
        'id="api-status"',
        'id="current-time"',
        'id="zone-select"',
        'id="timeline"',
        'type="module"',
        "three.module.js",
        "Herramienta complementaria",
    ]

    for fragment in required_fragments:
        assert fragment in html


def test_frontend_api_client_targets_fastapi_contract() -> None:
    api_js = read_frontend_file("js/api.js")
    config_js = read_frontend_file("js/config.js")

    assert 'API_BASE_URL = "http://127.0.0.1:8000"' in config_js
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


def test_frontend_scene_keeps_modular_3d_layers() -> None:
    scene_js = read_frontend_file("js/scene.js")

    required_imports = [
        "OrbitControls",
        'from "./ocean.js"',
        'from "./islands.js"',
        'from "./markers.js"',
        'from "./particles.js"',
        'from "./surfMedallion.js"',
        'from "./oceanLayers.js"',
    ]

    for fragment in required_imports:
        assert fragment in scene_js

    assert "export function createCommandScene" in scene_js


def test_oceanographic_layers_are_available() -> None:
    ocean_layers_js = read_frontend_file("js/oceanLayers.js")
    ocean_js = read_frontend_file("js/ocean.js")
    islands_js = read_frontend_file("js/islands.js")
    markers_js = read_frontend_file("js/markers.js")

    assert "export function createOceanLayers" in ocean_layers_js
    assert "export function createOcean" in ocean_js
    assert "export function createIslands" in islands_js
    assert "export function createMarkers" in markers_js


def test_frontend_avoids_legacy_frameworks_and_map_libraries() -> None:
    combined_frontend = "\n".join(
        path.read_text(encoding="utf-8")
        for path in [FRONTEND / "index.html", FRONTEND / "styles.css", *sorted((FRONTEND / "js").glob("*.js"))]
    )

    forbidden_fragments = ["React", "Vue", "Angular", "Vite", "Leaflet", "Chart.js"]
    for fragment in forbidden_fragments:
        assert fragment not in combined_frontend
