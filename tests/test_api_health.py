from fastapi.testclient import TestClient

from src.api.main import app


client = TestClient(app)


def test_health_returns_backend_status() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["service"] == "DeepWave Canarias API"
    assert "data_loaded" in payload
    assert "app_data_exists" in payload
    assert "missing_files" in payload


def test_openapi_contains_backend_endpoints() -> None:
    response = client.get("/openapi.json")

    assert response.status_code == 200
    paths = response.json()["paths"]
    for endpoint in (
        "/health",
        "/zones",
        "/predict/{zona_id}",
        "/predict/all",
        "/risk/{zona_id}",
        "/surf/{zona_id}",
        "/model/summary",
        "/legends/risk",
        "/legends/surf",
        "/examples",
    ):
        assert endpoint in paths
