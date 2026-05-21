# DeepWave Canarias

Sistema predictivo de oleaje, viento, marea y riesgo marítimo para zonas costeras de Canarias mediante Inteligencia Artificial y Big Data.

## Objetivo

DeepWave Canarias tiene como objetivo predecir el estado marítimo futuro en zonas costeras de Canarias, incluyendo altura significativa de ola, periodo, dirección del oleaje, viento, marea y niveles de riesgo para playa, navegación ligera y actividades deportivas.

## Pipeline de datos

El proyecto sigue una arquitectura tipo medallion:

- Bronze: datos originales descargados desde fuentes abiertas.
- Silver: datos limpios, normalizados y alineados temporalmente.
- Gold: datasets finales para entrenamiento de modelos.
- Gold multitarget: dataset ampliado para predicción física multivariable y módulos de riesgo.

## Modelos entrenados

Actualmente se han entrenado:

- LightGBMRegressor para predicción de altura significativa de ola.
- XGBClassifier para riesgo marítimo general.
- TCN como modelo profundo experimental.
- LightGBM multitarget físico para oleaje, periodo, dirección, viento y marea.
- Módulos de riesgo para playa y navegación en desarrollo.

## Tecnologías

- Python
- pandas
- pyarrow / Parquet
- scikit-learn
- LightGBM
- XGBoost
- Jupyter Notebook
- Google Drive / entorno local Mac M2 Pro

## Estado del proyecto

- Limpieza Silver: completada.
- Gold training dataset: completado.
- Gold multitarget dataset: completado.
- Modelos físicos multitarget: completados.
- Modelos de riesgo: en entrenamiento.