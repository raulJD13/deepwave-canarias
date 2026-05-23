# Performance benchmark summary

## Tabla resumen

| benchmark_type | env | test | requests_total | errors_total | mean_latency_ms_avg | p95_latency_ms_avg | max_latency_ms | rows_loaded | n_features | train_time_s | predict_time_s | total_time_s | mae | rmse | r2 | ram_after_train_mb |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| api | isardvdi | api_endpoints_mean | 550 | 0 | 1.5352 | 2.3740 | 12.3075 |  |  |  |  |  |  |  |  |  |
| api | mac_m2pro | api_endpoints_mean | 550 | 0 | 0.9419 | 1.2742 | 5.1146 |  |  |  |  |  |  |  |  |  |
| training | isardvdi | lightgbm_hs_24h |  |  |  |  |  | 50000 | 80 | 0.7905 | 0.0770 | 1.1529 | 0.3711 | 0.5500 | 0.5507 | 172.6100 |
| training | mac_m2pro | lightgbm_hs_24h |  |  |  |  |  | 50000 | 80 | 1.9126 | 0.0610 | 2.2148 | 0.3711 | 0.5500 | 0.5507 | 340.3400 |

## Interpretación

Este informe compara el rendimiento de DeepWave Canarias en IsardVDI y Mac M2 Pro.

Se evalúan dos bloques:

1. API de producción basada en app_data/*.json.
2. Entrenamiento reducido representativo usando LightGBM para target_hs_24h.

El entrenamiento completo del sistema no se repite en IsardVDI porque el proyecto final genera múltiples modelos físicos, de riesgo y surf. En su lugar se usa un caso representativo y reproducible: LightGBM para altura significativa de ola a +24h.

Esta prueba es adecuada porque hs es la variable principal del sistema y +24h es uno de los horizontes operativos más importantes.

## Conclusión

La estrategia de producción basada en app_data permite una API ligera, rápida y sin necesidad de cargar datasets Gold ni modelos pesados en tiempo de servicio.

## Figuras generadas

- `reports/performance/figures/performance_api_latency.png`
- `reports/performance/figures/performance_training_time.png`
- `reports/performance/figures/performance_training_metrics.png`
- `reports/performance/figures/performance_training_ram.png`

Estas figuras resumen visualmente la comparación entre IsardVDI y Mac M2 Pro para la API y para el benchmark reducido de entrenamiento.
