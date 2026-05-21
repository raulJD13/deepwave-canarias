# DeepWave Canarias — Production Serving Artifacts

## Objetivo

Este paquete contiene artefactos ligeros para servir predicciones marítimas, riesgo y surf score desde una API FastAPI y una aplicación cliente web.

## Entradas utilizadas

- Predicciones físicas: `gold/model_results/multitarget_physical/predictions_val_test_core_targets.parquet`
- Resultados finales: `gold/model_results/final_report_multitarget`
- Gold multitarget: `gold/multitarget_training_dataset`

## Salidas generadas

- `app_data/zones.json`
- `app_data/forecast_by_zone.json`
- `app_data/predictions_flat.json`
- `app_data/latest_predictions.json`
- `app_data/model_summary.json`
- `app_data/api_contract.json`
- `app_data/risk_legend.json`
- `app_data/surf_legend.json`
- `app_data/frontend_config.json`
- `app_data/demo_examples.json`

## Contenido del paquete

- Zonas disponibles: **14**
- Predicciones planas: **70**
- Zonas con forecast: **14**
- Horizontes: **[3, 6, 12, 24, 48]**
- Split usado para demo: **test**
- Targets físicos incluidos: **hs, tp, wave_direction, wind_speed, wind_direction**

## Endpoints recomendados para FastAPI

- `GET /health` — Comprueba que la API está activa.
- `GET /zones` — Lista zonas disponibles con coordenadas y metadatos.
- `GET /predict/{zona_id}` — Devuelve forecast completo por zona.
- `GET /predict/all` — Devuelve predicción seleccionada para todas las zonas. Útil para mapa.
- `GET /risk/{zona_id}` — Devuelve riesgos general, playa y navegación por zona.
- `GET /surf/{zona_id}` — Devuelve surf score y categoría por zona.
- `GET /model/summary` — Resumen del sistema de modelos y métricas.

## Estrategia de producción

La primera versión de producción usará predicciones precalculadas. Esto reduce consumo de RAM, evita cargar modelos pesados en la API y permite una demo estable.

## Próximo paso

Crear el backend FastAPI leyendo los JSON de `app_data/` y exponer los endpoints definidos en `api_contract.json`.

## Nota importante

Estos datos son artefactos de demostración basados en predicciones del conjunto de validación/test. Para una producción real operativa, el pipeline debería actualizar `app_data/` con predicciones recientes.
