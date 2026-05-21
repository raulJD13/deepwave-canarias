from fastapi.testclient import TestClient

from src.api.main import app


client = TestClient(app)


def test_zones_returns_non_empty_list() -> None:
    response = client.get("/zones")

    assert response.status_code == 200
    zones = response.json()
    assert isinstance(zones, list)
    assert zones
    assert "zona_id" in zones[0]

