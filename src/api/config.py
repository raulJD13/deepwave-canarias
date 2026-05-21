from pathlib import Path


SERVICE_NAME = "DeepWave Canarias API"
API_VERSION = "0.1.0"

PROJECT_ROOT = Path(__file__).resolve().parents[2]
APP_DATA_DIR = PROJECT_ROOT / "app_data"

VALID_HORIZONS = (3, 6, 12, 24, 48)

REQUIRED_APP_DATA_FILES = (
    "zones.json",
    "forecast_by_zone.json",
    "predictions_flat.json",
    "latest_predictions.json",
    "model_summary.json",
    "api_contract.json",
    "risk_legend.json",
    "surf_legend.json",
    "frontend_config.json",
    "demo_examples.json",
    "production_readiness_report.md",
    "production_manifest.json",
)

JSON_FILES = tuple(file_name for file_name in REQUIRED_APP_DATA_FILES if file_name.endswith(".json"))

CORS_ALLOW_ORIGINS = (
    "http://127.0.0.1:8000",
    "http://localhost:8000",
    "http://127.0.0.1:5500",
    "http://localhost:5500",
)

