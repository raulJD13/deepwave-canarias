# Surf score module — DeepWave Canarias

## Dataset

- Entrada: `/Users/rauljimenez/Development/Projects/AI-Projects/deep-wave-canarias/gold/multitarget_training_dataset`
- Filas: 983,328
- Columnas: 673
- Horizontes: [3, 6, 12, 24, 48]
- Predicciones físicas disponibles: True
- DirectLGBMSurfScore entrenado: True

## Interpretación

El surf score es un índice físico de 0 a 10 basado en altura de ola, periodo, viento y orientación costera.
No procede de etiquetas reales de surfistas, por lo que se recomienda usarlo como módulo interpretable basado en reglas físicas.

## Recomendación por horizonte

- +3h: CurrentConditionsSurfScore (MAE=0.5797, RMSE=1.0514, macro_f1_quality=0.7483, balanced_acc_quality=0.7521, score=0.7754)
- +6h: DirectLGBMSurfScore (MAE=0.7234, RMSE=1.0609, macro_f1_quality=0.6522, balanced_acc_quality=0.6415, score=0.6980)
- +12h: PhysicalDerivedSurfScore (MAE=0.9606, RMSE=1.4693, macro_f1_quality=0.5476, balanced_acc_quality=0.5255, score=0.6027)
- +24h: PhysicalDerivedSurfScore (MAE=1.2768, RMSE=1.8454, macro_f1_quality=0.4260, balanced_acc_quality=0.4101, score=0.4896)
- +48h: PhysicalDerivedSurfScore (MAE=1.5654, RMSE=2.1619, macro_f1_quality=0.3114, balanced_acc_quality=0.3181, score=0.3878)

## Nota metodológica

Si DirectLGBMSurfScore obtiene métricas altas, debe interpretarse como un modelo sustituto que aprende reglas ya definidas.
Para la versión final del sistema se prioriza PhysicalDerivedSurfScore por estar conectado a las predicciones físicas de oleaje y viento.