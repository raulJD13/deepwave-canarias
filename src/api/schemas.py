from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class FlexibleModel(BaseModel):
    model_config = ConfigDict(extra="allow")


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    data_loaded: bool
    app_data_exists: bool
    missing_files: list[str] = Field(default_factory=list)
    load_errors: dict[str, str] = Field(default_factory=dict)
    valid_horizons: list[int]


class Zone(FlexibleModel):
    zona_id: str
    name: str | None = None
    isla: str | None = None
    latitude: float | None = None
    longitude: float | None = None


class Prediction(FlexibleModel):
    zona_id: str
    zone_name: str | None = None
    isla: str | None = None
    horizon_hours: int | None = None
    physical: dict[str, Any] | None = None
    risk_general: dict[str, Any] | None = None
    risk_beach: dict[str, Any] | None = None
    risk_navigation: dict[str, Any] | None = None
    surf: dict[str, Any] | None = None
    recommendation: str | None = None


class ZoneForecast(FlexibleModel):
    zone: dict[str, Any]
    forecast: list[dict[str, Any]]
    available_horizons: list[int] = Field(default_factory=list)
    updated_at: str | None = None


class RiskByHorizon(BaseModel):
    horizon_hours: int | None
    risk_general: dict[str, Any] | None = None
    risk_beach: dict[str, Any] | None = None
    risk_navigation: dict[str, Any] | None = None


class RiskResponse(BaseModel):
    zona_id: str
    zone: dict[str, Any]
    risks: list[RiskByHorizon]


class SurfByHorizon(BaseModel):
    horizon_hours: int | None
    surf: dict[str, Any] | None = None


class SurfResponse(BaseModel):
    zona_id: str
    zone: dict[str, Any]
    surf: list[SurfByHorizon]

JsonDict = dict[str, Any]

