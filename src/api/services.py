from __future__ import annotations

import json
import math
from functools import lru_cache
from json import JSONDecodeError
from pathlib import Path
from typing import Any

from .config import APP_DATA_DIR, JSON_FILES, REQUIRED_APP_DATA_FILES, VALID_HORIZONS


class AppDataError(RuntimeError):
    """Raised when required production artifacts cannot be loaded."""


def app_data_exists() -> bool:
    return APP_DATA_DIR.exists() and APP_DATA_DIR.is_dir()


def missing_required_files() -> list[str]:
    if not app_data_exists():
        return list(REQUIRED_APP_DATA_FILES)
    return [file_name for file_name in REQUIRED_APP_DATA_FILES if not (APP_DATA_DIR / file_name).is_file()]


def validate_horizon(horizon: int | None) -> int | None:
    if horizon is None:
        return None
    if horizon not in VALID_HORIZONS:
        valid_values = ", ".join(str(value) for value in VALID_HORIZONS)
        raise ValueError(f"Unsupported horizon '{horizon}'. Valid horizons are: {valid_values}.")
    return horizon


def normalize_json_value(value: Any) -> Any:
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            return None
        return value
    if isinstance(value, list):
        return [normalize_json_value(item) for item in value]
    if isinstance(value, dict):
        return {str(key): normalize_json_value(item) for key, item in value.items()}
    return value


def load_json_file(file_name: str) -> Any:
    if file_name not in JSON_FILES:
        raise AppDataError(f"File '{file_name}' is not an allowed app_data JSON artifact.")

    file_path = (APP_DATA_DIR / file_name).resolve()
    app_data_path = APP_DATA_DIR.resolve()
    if app_data_path not in file_path.parents:
        raise AppDataError("Attempted to read outside app_data.")
    if not file_path.is_file():
        raise AppDataError(f"Required app_data file is missing: {file_name}.")

    try:
        with file_path.open("r", encoding="utf-8") as file:
            return normalize_json_value(json.load(file))
    except JSONDecodeError as exc:
        raise AppDataError(f"Invalid JSON in {file_name}: {exc.msg}.") from exc
    except OSError as exc:
        raise AppDataError(f"Could not read {file_name}: {exc}.") from exc


@lru_cache(maxsize=1)
def load_app_data() -> dict[str, Any]:
    missing = missing_required_files()
    missing_json = [file_name for file_name in missing if file_name.endswith(".json")]
    if missing_json:
        raise AppDataError(f"Missing required JSON files: {', '.join(missing_json)}.")
    return {file_name: load_json_file(file_name) for file_name in JSON_FILES}


def data_load_errors() -> dict[str, str]:
    errors: dict[str, str] = {}
    if not app_data_exists():
        errors["app_data"] = "app_data directory does not exist."
        return errors

    for file_name in JSON_FILES:
        try:
            load_json_file(file_name)
        except AppDataError as exc:
            errors[file_name] = str(exc)
    return errors


def health_status() -> dict[str, Any]:
    errors = data_load_errors()
    missing = missing_required_files()
    return {
        "data_loaded": not errors and not [item for item in missing if item.endswith(".json")],
        "app_data_exists": app_data_exists(),
        "missing_files": missing,
        "load_errors": errors,
    }


def _zones_payload() -> dict[str, Any]:
    payload = load_app_data().get("zones.json", {})
    return payload if isinstance(payload, dict) else {}


def list_zones() -> list[dict[str, Any]]:
    zones = _zones_payload().get("zones", [])
    return zones if isinstance(zones, list) else []


def get_zone(zona_id: str) -> dict[str, Any] | None:
    normalized_id = zona_id.strip()
    return next((zone for zone in list_zones() if str(zone.get("zona_id")) == normalized_id), None)


def _forecast_payload() -> dict[str, Any]:
    payload = load_app_data().get("forecast_by_zone.json", {})
    return payload if isinstance(payload, dict) else {}


def _forecast_data() -> dict[str, Any]:
    data = _forecast_payload().get("data", {})
    return data if isinstance(data, dict) else {}


def _flat_predictions_payload() -> dict[str, Any]:
    payload = load_app_data().get("predictions_flat.json", {})
    return payload if isinstance(payload, dict) else {}


def _prediction_horizon(prediction: dict[str, Any]) -> int | None:
    raw_horizon = prediction.get("horizon_hours", prediction.get("horizon"))
    try:
        return int(raw_horizon)
    except (TypeError, ValueError):
        return None


def _filter_predictions_by_horizon(predictions: list[dict[str, Any]], horizon: int | None) -> list[dict[str, Any]]:
    validate_horizon(horizon)
    if horizon is None:
        return predictions
    return [prediction for prediction in predictions if _prediction_horizon(prediction) == horizon]


def get_zone_forecast(zona_id: str, horizon: int | None = None) -> dict[str, Any] | dict[str, Any]:
    validate_horizon(horizon)
    zone_id = zona_id.strip()
    forecast_entry = _forecast_data().get(zone_id)
    if not isinstance(forecast_entry, dict):
        return {}

    forecast = forecast_entry.get("forecast", [])
    forecast_list = forecast if isinstance(forecast, list) else []
    if horizon is not None:
        matches = _filter_predictions_by_horizon(forecast_list, horizon)
        return matches[0] if matches else {}

    return {
        "zone": forecast_entry.get("zone") or get_zone(zone_id) or {"zona_id": zone_id},
        "forecast": forecast_list,
        "available_horizons": forecast_entry.get("available_horizons", []),
        "updated_at": forecast_entry.get("updated_at"),
    }


def list_predictions(horizon: int | None = None) -> list[dict[str, Any]]:
    predictions = _flat_predictions_payload().get("predictions", [])
    prediction_list = predictions if isinstance(predictions, list) else []
    return _filter_predictions_by_horizon(prediction_list, horizon)


def get_risk_by_zone(zona_id: str) -> dict[str, Any]:
    zone = get_zone(zona_id)
    if zone is None:
        return {}
    forecast = get_zone_forecast(zona_id)
    forecast_list = forecast.get("forecast", []) if isinstance(forecast, dict) else []
    risks = [
        {
            "horizon_hours": _prediction_horizon(prediction),
            "risk_general": prediction.get("risk_general"),
            "risk_beach": prediction.get("risk_beach"),
            "risk_navigation": prediction.get("risk_navigation"),
        }
        for prediction in forecast_list
        if isinstance(prediction, dict)
    ]
    return {"zona_id": zone["zona_id"], "zone": zone, "risks": risks}


def get_surf_by_zone(zona_id: str) -> dict[str, Any]:
    zone = get_zone(zona_id)
    if zone is None:
        return {}
    forecast = get_zone_forecast(zona_id)
    forecast_list = forecast.get("forecast", []) if isinstance(forecast, dict) else []
    surf = [
        {
            "horizon_hours": _prediction_horizon(prediction),
            "surf": prediction.get("surf"),
        }
        for prediction in forecast_list
        if isinstance(prediction, dict)
    ]
    return {"zona_id": zone["zona_id"], "zone": zone, "surf": surf}


def get_model_summary() -> dict[str, Any]:
    payload = load_app_data().get("model_summary.json", {})
    return payload if isinstance(payload, dict) else {"data": payload}


def get_risk_legend() -> dict[str, Any]:
    payload = load_app_data().get("risk_legend.json", {})
    return payload if isinstance(payload, dict) else {"data": payload}


def get_surf_legend() -> dict[str, Any]:
    payload = load_app_data().get("surf_legend.json", {})
    return payload if isinstance(payload, dict) else {"data": payload}


def get_examples() -> dict[str, Any]:
    payload = load_app_data().get("demo_examples.json", {})
    return payload if isinstance(payload, dict) else {"data": payload}


def required_files_present() -> bool:
    return not missing_required_files()

