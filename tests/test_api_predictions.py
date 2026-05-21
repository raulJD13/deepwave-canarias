from fastapi.testclient import TestClient

from src.api.main import app


client = TestClient(app)


def _valid_zone_id() -> str:
    response = client.get("/zones")
    response.raise_for_status()
    return response.json()[0]["zona_id"]


def test_predict_all_returns_predictions() -> None:
    response = client.get("/predict/all")

    assert response.status_code == 200
    predictions = response.json()
    assert isinstance(predictions, list)
    assert predictions


def test_predict_all_filters_by_horizon() -> None:
    response = client.get("/predict/all?horizon=24")

    assert response.status_code == 200
    predictions = response.json()
    assert predictions
    assert {prediction["horizon_hours"] for prediction in predictions} == {24}


def test_predict_zone_returns_full_forecast() -> None:
    zone_id = _valid_zone_id()

    response = client.get(f"/predict/{zone_id}")

    assert response.status_code == 200
    payload = response.json()
    assert payload["zone"]["zona_id"] == zone_id
    assert payload["forecast"]


def test_predict_zone_filters_by_horizon() -> None:
    zone_id = _valid_zone_id()

    response = client.get(f"/predict/{zone_id}?horizon=24")

    assert response.status_code == 200
    payload = response.json()
    assert payload["zona_id"] == zone_id
    assert payload["horizon_hours"] == 24


def test_unknown_zone_returns_404() -> None:
    response = client.get("/predict/UNKNOWN_ZONE")

    assert response.status_code == 404


def test_invalid_horizon_returns_400_or_422() -> None:
    zone_id = _valid_zone_id()

    response = client.get(f"/predict/{zone_id}?horizon=99")

    assert response.status_code in {400, 422}


def test_risk_zone_returns_risks() -> None:
    zone_id = _valid_zone_id()

    response = client.get(f"/risk/{zone_id}")

    assert response.status_code == 200
    payload = response.json()
    assert payload["zona_id"] == zone_id
    assert payload["risks"]


def test_surf_zone_returns_surf_scores() -> None:
    zone_id = _valid_zone_id()

    response = client.get(f"/surf/{zone_id}")

    assert response.status_code == 200
    payload = response.json()
    assert payload["zona_id"] == zone_id
    assert payload["surf"]


def test_metadata_endpoints_return_200() -> None:
    for endpoint in ("/model/summary", "/legends/risk", "/legends/surf", "/examples"):
        response = client.get(endpoint)
        assert response.status_code == 200
        assert response.json()

