from typing import Annotated, Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .config import API_VERSION, CORS_ALLOW_ORIGINS, SERVICE_NAME, VALID_HORIZONS
from .schemas import (
    HealthResponse,
    Prediction,
    RiskResponse,
    SurfResponse,
    Zone,
    ZoneForecast,
)
from .services import (
    AppDataError,
    get_examples,
    get_model_summary,
    get_risk_by_zone,
    get_risk_legend,
    get_surf_by_zone,
    get_surf_legend,
    get_zone,
    get_zone_forecast,
    health_status,
    list_predictions,
    list_zones,
    validate_horizon,
)


app = FastAPI(
    title=SERVICE_NAME,
    version=API_VERSION,
    description=(
        "API REST para consultar artefactos precalculados de oleaje, viento, "
        "riesgo maritimo y surf score de DeepWave Canarias."
    ),
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(CORS_ALLOW_ORIGINS),
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


def _horizon_or_400(horizon: int | None) -> int | None:
    try:
        return validate_horizon(horizon)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


def _handle_app_data_error(exc: AppDataError) -> HTTPException:
    return HTTPException(status_code=503, detail=str(exc))


@app.get("/health", response_model=HealthResponse, tags=["health"])
def health() -> dict[str, Any]:
    data_status = health_status()
    return {
        "status": "ok" if data_status["data_loaded"] else "degraded",
        "service": SERVICE_NAME,
        "version": API_VERSION,
        "valid_horizons": list(VALID_HORIZONS),
        **data_status,
    }


@app.get("/zones", response_model=list[Zone], tags=["zones"])
def zones() -> list[dict[str, Any]]:
    try:
        return list_zones()
    except AppDataError as exc:
        raise _handle_app_data_error(exc)


@app.get("/predict/all", response_model=list[Prediction], tags=["predictions"])
def predict_all(
    horizon: Annotated[int | None, Query(description="Horizonte en horas: 3, 6, 12, 24 o 48.")] = None,
) -> list[dict[str, Any]]:
    try:
        return list_predictions(_horizon_or_400(horizon))
    except AppDataError as exc:
        raise _handle_app_data_error(exc)


@app.get("/predict/{zona_id}", response_model=ZoneForecast | Prediction, tags=["predictions"])
def predict_zone(
    zona_id: str,
    horizon: Annotated[int | None, Query(description="Horizonte en horas: 3, 6, 12, 24 o 48.")] = None,
) -> dict[str, Any]:
    try:
        if get_zone(zona_id) is None:
            raise HTTPException(status_code=404, detail=f"Unknown zona_id: {zona_id}.")

        result = get_zone_forecast(zona_id, _horizon_or_400(horizon))
        if not result:
            raise HTTPException(
                status_code=404,
                detail=f"No prediction found for zona_id '{zona_id}' and horizon '{horizon}'.",
            )
        return result
    except AppDataError as exc:
        raise _handle_app_data_error(exc)


@app.get("/risk/{zona_id}", response_model=RiskResponse, tags=["risk"])
def risk_zone(zona_id: str) -> dict[str, Any]:
    try:
        result = get_risk_by_zone(zona_id)
        if not result:
            raise HTTPException(status_code=404, detail=f"Unknown zona_id: {zona_id}.")
        return result
    except AppDataError as exc:
        raise _handle_app_data_error(exc)


@app.get("/surf/{zona_id}", response_model=SurfResponse, tags=["surf"])
def surf_zone(zona_id: str) -> dict[str, Any]:
    try:
        result = get_surf_by_zone(zona_id)
        if not result:
            raise HTTPException(status_code=404, detail=f"Unknown zona_id: {zona_id}.")
        return result
    except AppDataError as exc:
        raise _handle_app_data_error(exc)


@app.get("/model/summary", tags=["model"])
def model_summary() -> dict[str, Any]:
    try:
        return get_model_summary()
    except AppDataError as exc:
        raise _handle_app_data_error(exc)


@app.get("/legends/risk", tags=["legends"])
def risk_legend() -> dict[str, Any]:
    try:
        return get_risk_legend()
    except AppDataError as exc:
        raise _handle_app_data_error(exc)


@app.get("/legends/surf", tags=["legends"])
def surf_legend() -> dict[str, Any]:
    try:
        return get_surf_legend()
    except AppDataError as exc:
        raise _handle_app_data_error(exc)


@app.get("/examples", tags=["examples"])
def examples() -> dict[str, Any]:
    try:
        return get_examples()
    except AppDataError as exc:
        raise _handle_app_data_error(exc)

