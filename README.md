# DeepWave Canarias

DeepWave Canarias Sistema predictivo de oleaje y riesgo marítimo mediante Inteligencia Artificial y Big Data Qué es el proyecto y qué problema resuelve DeepWave Canarias es un sistema de predicción oceanográfica y meteorológica basado en Inteligencia Artificial y Big Data, diseñado para anticipar las condiciones marítimas en zonas costeras de las Islas Canarias con un horizonte de 24 a 48 horas. El objetivo principal del proyecto es predecir el estado del mar en puntos concretos del litoral canario, incluyendo variables como la altura significativa de ola, el periodo del oleaje, la dirección del swell, el viento, las corrientes, la marea y un nivel de riesgo marítimo asociado. A diferencia de un sistema que simplemente mide el estado actual del mar, DeepWave Canarias busca anticipar situaciones de riesgo antes de que ocurran. Esto permite mejorar la toma de decisiones en actividades costeras y marítimas como el baño, el surf, el kitesurf, la navegación recreativa, la pesca costera, las excursiones marítimas, el kayak, el paddle surf y la gestión de seguridad en playas. El problema real que resuelve es que muchos servicios actuales ofrecen información marítima general o basada en modelos globales, pero no siempre se adaptan bien a las particularidades locales del archipiélago canario. Cada playa o zona costera tiene un comportamiento diferente debido a la orientación, el fondo marino, la exposición al swell, los vientos alisios, la marea y la presencia de obstáculos naturales. Por ejemplo, una misma altura de ola puede representar un riesgo bajo en una playa protegida y un riesgo alto en una zona rocosa o expuesta. Del mismo modo, determinadas combinaciones de viento, oleaje y periodo pueden ser peligrosas para pequeñas embarcaciones aunque no parezcan extremas a simple vista. Por ello, DeepWave Canarias propone un sistema predictivo local que utiliza datos históricos reales de boyas oceanográficas, meteorología, mareas y otras fuentes abiertas para generar predicciones específicas por zona, playa o punto costero. El producto final estará formado por dos elementos principales: Una API REST que permita consultar predicciones marítimas por zona o playa. Un dashboard web interactivo con mapa de Canarias, indicadores de riesgo y evolución prevista del estado del mar. Este enfoque encaja mejor con los requisitos del proyecto final, ya que el PDF oficial pide una solución tecnológica innovadora que combine IA y Big Data, resuelva un problema real, incluya dataset, modelo predictivo, evaluación, API/aplicación cliente y presentación final. Objetivo general del proyecto El objetivo general de DeepWave Canarias es desarrollar un sistema inteligente capaz de predecir el oleaje y el riesgo marítimo en zonas costeras de Canarias, utilizando técnicas de Inteligencia Artificial y procesamiento de grandes volúmenes de datos históricos. El sistema permitirá anticipar las condiciones del mar a 24 y 48 horas, generando información útil para la seguridad de bañistas, socorristas, surfistas y pequeñas embarcaciones. Objetivos específicos Los objetivos específicos del proyecto son: Recopilar datos históricos oceanográficos y meteorológicos de fuentes abiertas. Construir un dataset estructurado con datos de boyas, viento, marea y variables temporales. Limpiar, transformar y optimizar los datos usando una arquitectura tipo bronze, silver y gold. Entrenar modelos predictivos para estimar la evolución del oleaje y el viento. Clasificar el nivel de riesgo marítimo en bajo, medio o alto. Generar recomendaciones diferenciadas para playas y pequeñas embarcaciones. Desarrollar una API REST que exponga las predicciones. Crear un Ocean Command Center web con mapa 3D de Canarias, capas oceanográficas y visualización de resultados. Evaluar el sistema mediante métricas de error, clasificación y rendimiento. Documentar el comportamiento del sistema en IsardVDI y otros entornos. Usuarios potenciales del sistema DeepWave Canarias está pensado para varios tipos de usuarios: Socorristas y servicios municipales, que podrían consultar el riesgo previsto para apoyar la toma de decisiones sobre banderas o avisos preventivos. Bañistas y turistas, que podrían saber si una playa presenta condiciones seguras o si existe riesgo por oleaje, viento o corrientes. Surfistas y escuelas de surf, que podrían consultar la calidad prevista del oleaje, la mejor franja horaria y el tipo de swell esperado. Pequeñas embarcaciones recreativas, que podrían recibir una recomendación de navegación según el oleaje, viento y periodo previsto. Empresas de actividades marítimas, como excursiones en barco, kayak, paddle surf, motos de agua o kitesurf, que podrían planificar mejor sus salidas. Administraciones locales, que podrían integrar la API en aplicaciones turísticas, portales municipales o sistemas de información costera. Fuentes de datos El sistema se alimentará de varias fuentes de datos abiertas y gratuitas. La fuente principal será la red de boyas oceanográficas de Puertos del Estado, que proporciona datos históricos y actuales sobre variables marítimas como altura significativa de ola, altura máxima, periodo del oleaje, dirección del swell, temperatura superficial del mar y, en algunos casos, corrientes. La segunda fuente será AEMET OpenData, que permitirá incorporar información meteorológica como velocidad del viento, dirección del viento, presión atmosférica, temperatura del aire y precipitación. Estos datos son importantes porque el viento influye directamente en la generación de oleaje local y en la seguridad de las actividades marítimas. La tercera fuente será el Instituto Hidrográfico de la Marina, que publica tablas de mareas. A partir de estas tablas se podrán calcular variables como pleamar, bajamar, altura de marea y fase del ciclo mareal. Como mejora opcional, se podrá utilizar Copernicus Marine Service, que ofrece información sobre corrientes oceánicas superficiales y otros productos oceanográficos. Esta fuente puede ser útil para mejorar el análisis de zonas donde las corrientes sean especialmente relevantes. Construcción del dataset El pipeline de datos seguirá una arquitectura tipo medallion simplificada, dividida en tres capas: Capa bronze En esta capa se almacenarán los datos originales tal como llegan desde las APIs. Los datos se guardarán sin modificaciones para conservar una copia bruta y reproducible de cada fuente. Capa silver En esta capa se realizará la limpieza de datos. Se corregirán formatos de fecha, se alinearán las distintas fuentes a una resolución temporal común, se detectarán valores anómalos y se gestionarán valores ausentes. Capa gold En esta capa se construirá el dataset final para entrenamiento. Se generarán variables derivadas, ventanas temporales, variables cíclicas, interacciones físicas y etiquetas de riesgo. El formato principal de almacenamiento será Parquet, porque es eficiente para datos tabulares, permite compresión, facilita consultas rápidas y se integra bien con herramientas como pandas, polars y DuckDB. Variables del dataset El dataset incluirá variables oceanográficas, meteorológicas, temporales y de riesgo. Entre las variables oceanográficas estarán: Altura significativa de ola. Altura máxima de ola. Periodo pico del oleaje. Dirección media del oleaje. Temperatura superficial del mar. Corrientes, si están disponibles. Entre las variables meteorológicas estarán: Velocidad del viento. Dirección del viento. Presión atmosférica. Temperatura del aire. Precipitación. Entre las variables temporales estarán: Hora del día. Día de la semana. Mes del año. Estación del año. Variables seno y coseno para representar ciclos temporales. Estado de la marea. Tiempo hasta la próxima pleamar o bajamar. También se crearán variables derivadas como: Energía aproximada del oleaje. Producto entre altura de ola y periodo. Diferencia respecto a la media histórica. Tendencia de las últimas 6, 12, 24 y 72 horas. Variación reciente del viento. Combinación entre dirección de oleaje y orientación de la costa. Calidad e integridad de los datos La calidad del dataset será una parte importante del proyecto. Se controlarán aspectos como completitud, coherencia temporal, valores fuera de rango y porcentaje de datos imputados. Los valores físicamente imposibles, como alturas de ola extremadamente elevadas para la zona, se marcarán como posibles outliers. No se eliminarán automáticamente, ya que algunos eventos extremos pueden ser reales y son importantes para el modelo. Los valores ausentes podrán imputarse mediante técnicas como interpolación temporal, medias móviles o KNN usando estaciones cercanas. Además, se generará una variable de calidad que indique si un dato es real, imputado o sospechoso. Para documentar esta parte se podrán usar reglas de validación con Great Expectations, por ejemplo: Porcentaje máximo de nulos por columna. Rango válido de altura de ola. Rango válido de dirección entre 0 y 360 grados. Frecuencia temporal esperada. Fechas duplicadas. Valores negativos no permitidos. Modelos de Inteligencia Artificial El sistema utilizará un enfoque modular. El modelo principal será de predicción de variables marítimas, y sobre esa predicción se construirán módulos adicionales de riesgo y recomendación. Modelo 1: predicción de oleaje y viento El modelo principal será un modelo de forecasting basado en XGBoost o LightGBM. Estos algoritmos son adecuados para datos tabulares y series temporales transformadas en ventanas de características. El modelo recibirá como entrada las condiciones de las últimas horas y predecirá variables futuras como: Altura significativa de ola. Periodo del oleaje. Dirección del swell. Velocidad del viento. Dirección del viento. Los horizontes de predicción serán principalmente: 6 horas. 12 horas. 24 horas. 48 horas. El modelo se entrenará con ventanas temporales de 24 a 72 horas. Para cada horizonte se podrá entrenar un modelo específico o usar una estrategia multioutput. Este será el núcleo mínimo viable del proyecto. Modelo 2: clasificación de riesgo marítimo A partir de las predicciones físicas, se desarrollará un clasificador de riesgo marítimo. Este modelo asignará una etiqueta: Riesgo bajo. Riesgo medio. Riesgo alto. El riesgo no dependerá únicamente de la altura de ola. También se tendrán en cuenta el periodo, el viento, la dirección del oleaje, la marea y las características de la zona. El sistema podrá generar dos tipos de riesgo: Riesgo para baño y playas, orientado a bañistas, socorristas y servicios municipales. Riesgo para pequeñas embarcaciones, orientado a navegación recreativa, pesca costera, excursiones marítimas y actividades náuticas ligeras. Esto permite que el sistema no sea solo una herramienta para playas, sino una solución más completa de seguridad marítima costera. Modelo 3: scoring de calidad de surf Como funcionalidad adicional, el sistema calculará una puntuación de calidad de surf de 0 a 10. Esta puntuación combinará variables como altura de ola, periodo, dirección del swell y viento. También tendrá en cuenta si el viento es offshore, onshore o lateral respecto a la orientación de la playa. El resultado podrá clasificarse en categorías como: Poor. Fair. Good. Very Good. Epic. Este módulo será útil para surfistas y escuelas de surf, pero no será el objetivo principal del proyecto. Se presentará como una aplicación adicional del sistema predictivo. Modelo 4: LSTM como modelo alternativo Como mejora o comparación avanzada, se podrá entrenar una red neuronal LSTM para analizar si mejora los resultados del modelo principal. La LSTM trabajará directamente con secuencias temporales de varias horas y podrá capturar dependencias largas en el comportamiento del oleaje. Sin embargo, se tratará como modelo alternativo o experimental. Esto es importante para mantener el alcance controlado: el modelo principal será XGBoost o LightGBM, y la LSTM servirá para comparar resultados y enriquecer el apartado de modelos alternativos. Qué predice el sistema Para cada zona costera o playa, el sistema generará predicciones para las próximas 24 a 48 horas. Las predicciones físicas incluirán: Altura significativa de ola. Periodo pico del oleaje. Dirección del swell. Velocidad del viento. Dirección del viento. Temperatura superficial del mar, si está disponible. Estado de la marea. Intervalo de confianza o rango de incertidumbre. Las predicciones de seguridad incluirán: Nivel de riesgo para bañistas. Recomendación de bandera. Nivel de riesgo para pequeñas embarcaciones. Mensaje preventivo generado por plantilla. Probabilidad asociada a cada nivel de riesgo. Las predicciones deportivas incluirán: Score de surf de 0 a 10. Mejor franja horaria. Tipo de oleaje esperado. Calidad prevista del viento. Recomendaciones del sistema El sistema no se limitará a mostrar números. También generará recomendaciones interpretables. Ejemplo para playas: Riesgo medio durante la tarde. Se espera oleaje de 1,8 metros con periodo de 11 segundos y viento moderado del noreste. Se recomienda precaución en zonas expuestas y vigilancia especial en corrientes de retorno. Ejemplo para embarcaciones pequeñas: Navegación no recomendable para embarcaciones ligeras durante las próximas 12 horas. Se prevé aumento del oleaje y viento moderado-fuerte. Consultar siempre los avisos oficiales antes de salir. Ejemplo para surf: Condiciones buenas entre las 08:00 y las 11:00. Swell limpio, periodo alto y viento favorable durante la mañana. Es importante dejar claro en la memoria que DeepWave Canarias no sustituye a los avisos oficiales marítimos, sino que funciona como una herramienta complementaria de análisis local y apoyo a la toma de decisiones. API REST El sistema expondrá sus resultados mediante una API desarrollada con FastAPI. Los endpoints principales serán: GET /zonas Devuelve la lista de zonas costeras o playas disponibles, con sus coordenadas y estado de datos. GET /predict/{zona_id} Devuelve la predicción para una zona concreta. Permitirá consultar horizontes de 6, 12, 24 o 48 horas. GET /predict/all Devuelve las predicciones de todas las zonas para alimentar el dashboard de forma eficiente. GET /historico/{zona_id} Devuelve datos históricos y comparación entre predicción y valor real. GET /riesgo/{zona_id} Devuelve el nivel de riesgo para bañistas y pequeñas embarcaciones. La API utilizará Pydantic v2 para validar entradas y salidas. La documentación automática estará disponible en /docs mediante Swagger UI. Dashboard web El dashboard será una aplicación web ligera construida con HTML, CSS y JavaScript vanilla. El elemento principal será un mapa interactivo de Canarias usando Three.js. Cada zona o playa tendrá un marcador de color según el riesgo previsto: Verde: riesgo bajo. Amarillo: riesgo medio. Rojo: riesgo alto. Al hacer clic sobre una zona, se abrirá un panel con: Predicción de oleaje para las próximas 48 horas. Gráfico de altura de ola. Gráfico de viento. Nivel de riesgo para bañistas. Nivel de riesgo para pequeñas embarcaciones. Score de surf. Recomendación textual. Datos actuales y predicción futura. Las gráficas se podrán implementar con módulos ES vanilla. Arquitectura técnica La arquitectura del sistema se dividirá en cinco capas. Capa de ingesta Scripts Python descargarán los datos desde las APIs externas. Esta capa se encargará de obtener datos de boyas, estaciones meteorológicas y mareas. Capa de almacenamiento Los datos se almacenarán en formato Parquet, organizados por fuente, zona y fecha. Se usará una estructura bronze, silver y gold para mantener el pipeline ordenado y reproducible. Capa de procesamiento Esta capa limpiará los datos, alineará las fuentes temporales, imputará valores ausentes, detectará outliers y generará las features necesarias para el modelo. Capa de modelado Aquí se entrenarán los modelos predictivos. Se utilizarán notebooks de Jupyter para exploración, entrenamiento, validación y comparación. Los experimentos podrán registrarse con MLflow. Capa de servicio y presentación La API FastAPI servirá las predicciones y el dashboard web las visualizará de forma sencilla mediante un mapa interactivo y gráficas temporales. Tecnologías utilizadas Las tecnologías principales serán: Lenguaje principal: Python 3.11. Procesamiento de datos: pandas, polars, DuckDB y Parquet. Ingesta de datos: requests o httpx. Modelado predictivo: scikit-learn, XGBoost, LightGBM y PyTorch. Evaluación y métricas: scikit-learn, statsmodels y métricas personalizadas. Calidad de datos: Great Expectations. MLOps: MLflow y opcionalmente DVC. API: FastAPI, Uvicorn y Pydantic v2. Dashboard: HTML, CSS, JavaScript vanilla ES modules y Three.js desde CDN. Despliegue: Docker. Entorno de trabajo: IsardVDI del IES El Rincón y entorno local. Evaluación del sistema La evaluación se dividirá en tres bloques. Evaluación de predicción física Para las variables continuas como altura de ola o viento se usarán métricas como: MAE. RMSE. MAPE. Skill score frente a climatología. El MAE permitirá saber el error medio en unidades reales. Por ejemplo, un MAE de 0,20 metros en altura de ola significa que el modelo se equivoca de media en 20 centímetros. El RMSE será especialmente importante porque penaliza más los errores grandes, que son los más peligrosos en situaciones marítimas. Evaluación del riesgo Para el clasificador de riesgo se usarán: Accuracy. F1-score macro. Recall de la clase de riesgo alto. Matriz de confusión. La métrica más importante será el recall de riesgo alto, porque el error más crítico sería predecir riesgo bajo cuando realmente existe un riesgo alto. Evaluación del rendimiento técnico Se medirán: Tiempo de descarga de datos. Tiempo de limpieza y procesamiento. Tiempo de entrenamiento. Tiempo de inferencia. Tiempo de respuesta de la API. Consumo de memoria. Tamaño del modelo en disco. Comparativa entre IsardVDI y entorno local. Esto permitirá cubrir el informe de rendimiento solicitado en el punto 8 de la memoria. Producto mínimo viable Para que el proyecto sea realista, el MVP debería incluir: Dataset histórico con datos de boyas y meteorología. Pipeline bronze, silver y gold. Modelo LightGBM o XGBoost para predecir altura de ola y viento. Clasificador básico de riesgo marítimo. API REST funcional. Ocean Command Center 3D con mapa marítimo, capas oceanográficas y panel operativo. Evaluación con métricas. Informe de rendimiento en IsardVDI. Repositorio GitHub. Memoria final en PDF. Mejoras opcionales Como mejoras futuras se podrían incluir: LSTM para comparar con modelos de boosting. Datos de Copernicus Marine Service. Predicción de corrientes. Más zonas costeras. Integración con datos reales de banderas de playa. App móvil. Sistema de alertas por email o Telegram. Modelos probabilísticos más avanzados. Explicabilidad con SHAP. Optimización automática con Optuna. Despliegue completo en la nube. Encaje con la memoria oficial El proyecto encaja muy bien con la estructura pedida: 1. Introducción Presentación del problema de predicción marítima local en Canarias. 2. Sumario de productos o resultados Dataset, modelos, API, dashboard, métricas y demo. 3. Contexto y justificación Necesidad de información marítima local para seguridad, turismo y actividades costeras. 3.1 Objetivos Predicción de oleaje, viento y riesgo marítimo. 3.2 Enfoque y metodología Pipeline de datos, modelado predictivo, evaluación y puesta en producción. 3.3 Planificación Organización por hitos: dataset, modelo, API, dashboard y memoria. 3.4 Recursos de sistemas utilizados IsardVDI, equipo local, Docker, uso de CPU/RAM y tiempos de entrenamiento. 4. Creación del set de datos Fuentes, recolección, limpieza, calidad y visualización. 5. Optimización y calidad del set de datos Parquet, DuckDB, imputación, outliers, normalización y validaciones. 6. Desarrollo del modelo predictivo Justificación de LightGBM/XGBoost y comparación con LSTM. 7. Entrenamiento y evaluación MAE, RMSE, MAPE, F1, recall de riesgo alto y matriz de confusión. 8. Informe de rendimiento y métricas Tiempos de ejecución en IsardVDI y entorno local. 9. Puesta en producción FastAPI, Docker, endpoints y dashboard. 10. Conclusiones y mejoras Limitaciones, mejoras futuras y modelos alternativos. 11. Bibliografía/Webgrafía APIs, documentación técnica y fuentes de datos. 12. Presentación final Demo en vivo del dashboard, API y resultados del modelo.


## Objetivo

DeepWave Canarias anticipa el estado marítimo futuro en zonas costeras de Canarias y transforma predicciones físicas en información operativa para baño, surf, navegación ligera y seguridad costera.

Horizontes de predicción:

```text
+3h, +6h, +12h, +24h y +48h
```

## Qué predice

Variables físicas principales:

- altura significativa de ola (`hs`)
- periodo medio (`tm02`)
- swell height / swell period
- dirección de ola
- velocidad y dirección del viento
- nivel del mar y rango mareal

Módulos derivados:

- riesgo general marítimo
- riesgo para playa/bañistas
- riesgo para navegación ligera
- surf score de 0 a 10 y categoría de calidad

## Arquitectura de datos

```text
Bronze → Silver → Gold → Gold multitarget
```

## Arquitectura final de modelado

```text
Predicción física con LightGBM
→ riesgo interpretable
→ surf score interpretable
```

## Resultados destacados

Ejemplos para `hs`:

- MAE +24h: `0.3159` m
- MAE +48h: `0.4432` m

## Estructura del repositorio

```text
deep-wave-canarias/
├── notebooks/
├── docs/
├── reports/
│   ├── figures/
│   ├── tables/
│   └── model_summaries/
├── requirements.txt
├── requirements-mac-m2pro.txt
├── README.md
└── .gitignore
```

## Importante

No se suben a GitHub datos pesados ni modelos:

```text
data/
silver/
gold/
models/
```

## Ejecución local y Docker

La API de producción lee únicamente los artefactos ligeros de `app_data/`. No necesita entrenar modelos ni cargar carpetas pesadas como `gold/`, `silver/`, `bronze/`, `data/` o `models/`.

Instalación local:

```bash
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Lanzar la API FastAPI sin Docker:

```bash
uvicorn src.api.main:app --reload --host 127.0.0.1 --port 8000
```

También se puede usar el script:

```bash
./scripts/run_api.sh
```

Swagger y endpoints principales:

```text
http://127.0.0.1:8000/docs
http://127.0.0.1:8000/health
http://127.0.0.1:8000/zones
http://127.0.0.1:8000/predict/all?horizon=24
```

Servir el frontend localmente:

```bash
cd frontend
python -m http.server 5500
```

O desde la raíz del proyecto:

```bash
./scripts/run_frontend.sh
```

URL del frontend:

```text
http://127.0.0.1:5500
```

Ejecutar tests:

```bash
pytest -q
```

O con:

```bash
./scripts/run_tests.sh
```

Lanzar con Docker:

```bash
docker compose up --build
```

O con:

```bash
./scripts/run_docker.sh
```

El servicio Docker `deepwave-api` expone la API en `http://127.0.0.1:8000` y mantiene Swagger disponible en `/docs`. La imagen copia solo `src/`, `app_data/`, `frontend/` y `requirements.txt`; `.dockerignore` excluye entornos locales, cachés, notebooks temporales, datos pesados y modelos.

DeepWave Canarias es una herramienta complementaria de apoyo a la decisión marítima. No sustituye avisos oficiales marítimos, meteorológicos, de socorrismo o emergencias.

## Limitaciones

- Las etiquetas de riesgo y surf son derivadas mediante reglas físicas.
- No se dispone de etiquetas oficiales de incidentes, banderas o valoraciones reales de surfistas.
- El horizonte +48h tiene mayor incertidumbre.
- El sistema es complementario y no sustituye avisos oficiales.
