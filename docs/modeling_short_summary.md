# Resumen final de modelado — DeepWave Canarias

## Estado

La fase de modelado queda completada. Se han consolidado modelos físicos, módulos de riesgo y módulo de surf score.

## Arquitectura final

1. Predicción física mediante LightGBM:
   - Variables principales: hs, tm02, swell_height, swell_period, wave_direction, wind_speed, wind_direction, sea_level, daily_tidal_range
   - Variables secundarias: tp, swell_direction, wind_wave_height

2. Riesgo marítimo:
   - Riesgo general
   - Riesgo playa/bañistas
   - Riesgo navegación ligera
   - Enfoque recomendado: riesgo derivado desde predicciones físicas, con persistencia como baseline fuerte en horizontes largos.

3. Surf score:
   - Score 0-10
   - Categorías: poor, fair, good, very_good, epic
   - Enfoque recomendado: PhysicalDerivedSurfScore.

## Limitación clave

Las etiquetas de riesgo y surf se derivan mediante reglas físicas, no mediante observaciones reales de incidentes, banderas de playa o valoraciones de surfistas.

## Salidas

- Tablas: `/Users/rauljimenez/Development/Projects/AI-Projects/deep-wave-canarias/reports/tables`
- Figuras: `/Users/rauljimenez/Development/Projects/AI-Projects/deep-wave-canarias/reports/figures`
- Informe: `/Users/rauljimenez/Development/Projects/AI-Projects/deep-wave-canarias/reports/model_summaries/final_modeling_report.md`
