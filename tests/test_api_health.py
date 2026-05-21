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

