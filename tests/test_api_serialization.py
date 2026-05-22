import math
from typing import Any

from fastapi.testclient import TestClient

from src.api.main import app


client = TestClient(app)


def assert_json_safe(value: Any) -> None:
    if isinstance(value, dict):
        for nested_value in value.values():
            assert_json_safe(nested_value)
        return

    if isinstance(value, list):
        for nested_value in value:
            assert_json_safe(nested_value)
        return

    if isinstance(value, float):
        assert math.isfinite(value), "API response contains NaN or infinity"


def test_core_api_payloads_are_json_safe() -> None:
    zones_response = client.get("/zones")
    assert zones_response.status_code == 200
    zones = zones_response.json()
    assert zones

    zona_id = zones[0]["zona_id"]
    endpoints = [
        "/health",
        "/zones",
        "/predict/all",
        "/predict/all?horizon=24",
        f"/predict/{zona_id}",
        f"/predict/{zona_id}?horizon=24",
        f"/risk/{zona_id}",
        f"/surf/{zona_id}",
        "/model/summary",
        "/legends/risk",
        "/legends/surf",
        "/examples",
    ]

    for endpoint in endpoints:
        response = client.get(endpoint)
        assert response.status_code == 200, endpoint
        assert_json_safe(response.json())
