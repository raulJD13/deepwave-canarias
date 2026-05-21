from src.api.config import APP_DATA_DIR, REQUIRED_APP_DATA_FILES, VALID_HORIZONS
from src.api.services import list_predictions, list_zones


def test_required_app_data_files_exist() -> None:
    missing = [file_name for file_name in REQUIRED_APP_DATA_FILES if not (APP_DATA_DIR / file_name).is_file()]

    assert missing == []


def test_app_data_has_zones_and_expected_horizons() -> None:
    assert list_zones()
    horizons = {prediction["horizon_hours"] for prediction in list_predictions()}

    assert set(VALID_HORIZONS).issubset(horizons)

