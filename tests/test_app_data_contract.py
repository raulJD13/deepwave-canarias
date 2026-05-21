from src.api.config import APP_DATA_DIR, REQUIRED_APP_DATA_FILES, VALID_HORIZONS
from src.api.services import AppDataError, list_predictions, list_zones, load_json_file, normalize_json_value


def test_required_app_data_files_exist() -> None:
    missing = [file_name for file_name in REQUIRED_APP_DATA_FILES if not (APP_DATA_DIR / file_name).is_file()]

    assert missing == []


def test_app_data_has_zones_and_expected_horizons() -> None:
    assert list_zones()
    horizons = {prediction["horizon_hours"] for prediction in list_predictions()}

    assert set(VALID_HORIZONS).issubset(horizons)


def test_normalize_json_value_converts_non_json_numbers_to_null() -> None:
    payload = {
        "nan": float("nan"),
        "positive_inf": float("inf"),
        "negative_inf": float("-inf"),
        "nested": [{"ok": 1.2}],
    }

    assert normalize_json_value(payload) == {
        "nan": None,
        "positive_inf": None,
        "negative_inf": None,
        "nested": [{"ok": 1.2}],
    }


def test_load_json_file_rejects_non_app_data_artifacts() -> None:
    try:
        load_json_file("../requirements.txt")
    except AppDataError as exc:
        assert "not an allowed app_data JSON artifact" in str(exc)
    else:
        raise AssertionError("load_json_file accepted a path outside the app_data contract")
