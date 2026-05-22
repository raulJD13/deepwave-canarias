# DeepWave Canarias

Sistema predictivo de oleaje, viento, riesgo marítimo y surf score para zonas costeras de Canarias.

DeepWave Canarias transforma predicciones físicas precalculadas en información operativa para apoyar la toma de decisiones en playas, surf, navegación ligera y servicios costeros. El proyecto integra una API FastAPI, artefactos ligeros de producción en JSON, un Ocean Command Center web en 3D y despliegue local con Docker.

> DeepWave Canarias es una herramienta complementaria de apoyo a la decisión marítima. No sustituye avisos oficiales marítimos, meteorológicos, de socorrismo o emergencias.

## Estado del proyecto

La fase de datos, modelado y generación de artefactos de producción está cerrada. La versión actual se centra en servir predicciones ya calculadas desde `app_data/`, sin cargar modelos pesados ni ejecutar entrenamiento en tiempo real.

Componentes implementados:

- API REST con FastAPI en `src/api/`.
- Artefactos ligeros de serving en `app_data/*.json`.
- Frontend web vanilla con Three.js en `frontend/`.
- Tests automatizados con `pytest`.
- Despliegue local con `Dockerfile` y `docker-compose.yml`.
- Scripts de ejecución para API, frontend, tests y Docker.

## Qué resuelve

Muchos servicios marítimos ofrecen información general, pero no siempre adaptada a la exposición local de cada zona costera canaria. DeepWave Canarias organiza predicciones físicas y módulos derivados para responder preguntas prácticas:

- Qué condiciones de oleaje y viento se esperan en una zona.
- Qué nivel de riesgo existe para playa, baño y navegación ligera.
- Qué calidad de surf se prevé según oleaje, periodo, viento y orientación.
- Qué recomendación operativa conviene mostrar de forma clara y responsable.

## Horizontes y variables

Horizontes disponibles:

```text
+3h, +6h, +12h, +24h, +48h
```

Variables físicas principales:

- `hs`: altura significativa de ola.
- `tp` / `tm02`: periodo de ola.
- `wave_direction`: dirección del oleaje.
- `wind_speed`: velocidad del viento.
- `wind_direction`: dirección del viento.

Módulos derivados:

- `risk_general`: riesgo marítimo general.
- `risk_beach`: riesgo para playa/bañistas.
- `risk_navigation`: riesgo para navegación ligera.
- `surf_score`: puntuación de calidad de surf de 0 a 10.
- `surf_quality`: categoría interpretativa de surf.

## Arquitectura

```text
datos históricos y fuentes abiertas
        ↓
pipeline Bronze / Silver / Gold
        ↓
modelos físicos LightGBM
        ↓
reglas interpretables de riesgo y surf
        ↓
app_data/*.json
        ↓
FastAPI backend
        ↓
Ocean Command Center web
```

La API de producción no lee Parquet, no carga `.pkl` o `.joblib` y no depende de librerías de machine learning. Su fuente de verdad son los JSON ligeros de `app_data/`.

## Resultados destacados

Resumen de los artefactos actuales:

- Zonas disponibles: `14`.
- Predicciones precalculadas: `70`.
- Horizontes: `3`, `6`, `12`, `24` y `48` horas.
- MAE de `hs` a +24h: `0.3159 m`.
- MAE de `hs` a +48h: `0.4432 m`.
- MAE de `surf_score` a +24h: `1.2768`.

Nota: los artefactos actuales son predicciones de demo precalculadas desde conjunto de test/validación. Para producción real, la API se conectaría a un pipeline de inferencia actualizado.

## Estructura del repositorio

```text
deep-wave-canarias/
├── app_data/                  # artefactos ligeros para serving
├── docs/                      # documentación técnica del proyecto
├── frontend/                  # Ocean Command Center web vanilla + Three.js
├── notebooks/                 # pipeline histórico, modelado y reporting
├── reports/                   # resultados, figuras y tablas finales
├── scripts/                   # comandos locales de ejecución
├── src/
│   └── api/                   # backend FastAPI
├── tests/                     # tests de API, datos, frontend y despliegue
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

Carpetas pesadas o reproducibles que no forman parte del runtime:

```text
data/
bronze/
silver/
gold/
models/
```

## API REST

La API se define en `src/api/main.py` y expone documentación automática con Swagger.

Endpoints principales:

| Método | Endpoint | Descripción |
| --- | --- | --- |
| `GET` | `/health` | Estado de la API y validación de `app_data/`. |
| `GET` | `/zones` | Lista de zonas costeras disponibles. |
| `GET` | `/predict/all` | Todas las predicciones disponibles. |
| `GET` | `/predict/all?horizon=24` | Predicciones filtradas por horizonte. |
| `GET` | `/predict/{zona_id}` | Predicción completa de una zona. |
| `GET` | `/predict/{zona_id}?horizon=24` | Predicción de una zona para un horizonte. |
| `GET` | `/risk/{zona_id}` | Riesgos general, playa y navegación por zona. |
| `GET` | `/surf/{zona_id}` | Surf score y calidad por zona. |
| `GET` | `/model/summary` | Resumen del modelo y artefactos. |
| `GET` | `/legends/risk` | Leyenda de riesgo. |
| `GET` | `/legends/surf` | Leyenda de surf. |
| `GET` | `/examples` | Ejemplos de uso para demo. |

Validaciones incluidas:

- `404` para zonas desconocidas.
- `400` para horizontes no soportados.
- Normalización de `NaN` e infinitos.
- Errores claros si falta `app_data/` o algún artefacto obligatorio.
- Lectura restringida a los archivos esperados dentro de `app_data/`.

## Frontend

El frontend está en `frontend/` y usa HTML, CSS, JavaScript vanilla con módulos ES y Three.js desde CDN.

Características principales:

- Escena 3D del archipiélago canario.
- Océano animado y capas oceanográficas.
- Marcadores de zonas monitorizadas.
- Timeline de horizontes.
- Panel lateral con métricas físicas, riesgo, surf score y recomendación.
- Estado de conexión con la API.
- Diseño responsive de estilo centro de control marítimo.

La URL local por defecto es:

```text
http://127.0.0.1:5500
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

## Tests y calidad

La suite actual comprueba:

- Salud de la API.
- Contrato de `app_data/`.
- Zonas válidas e inválidas.
- Horizontes válidos e inválidos.
- Predicciones, riesgo, surf score, leyendas y ejemplos.
- Serialización JSON sin `NaN` ni infinitos.
- Contrato básico del frontend.
- Sintaxis de módulos JavaScript.
- Contrato de Docker y scripts.
- Ausencia de dependencias ML en el runtime backend.

Comando:

```bash
pytest -q
```

Resultado verificado:

```text
32 passed
```

## Datos y modelado

El pipeline histórico sigue una arquitectura medallion:

```text
Bronze → Silver → Gold → Gold multitarget → Modeling → Production artifacts
```

La arquitectura final seleccionada es:

```text
LightGBM para predicciones físicas
→ reglas interpretables para riesgo marítimo
→ reglas interpretables para surf score
```

Los notebooks quedan como trazabilidad del proceso de datos, entrenamiento, comparación y generación de artefactos. La aplicación en producción no ejecuta esos notebooks.

## Seguridad y limitaciones

- El sistema no emite avisos oficiales.
- Las recomendaciones son orientativas y deben formularse con precaución.
- Las etiquetas de riesgo y surf derivan de reglas físicas y predicciones, no de partes oficiales de incidentes.
- El horizonte +48h tiene mayor incertidumbre.
- Los artefactos actuales son estáticos y sirven para demo académica de puesta en producción.

## Tecnologías

- Python 3.11.
- FastAPI.
- Pydantic.
- Uvicorn.
- Pytest.
- Docker.
- HTML, CSS y JavaScript vanilla.
- Three.js.

## Documentación relacionada

- `docs/production_serving_artifacts.md`
- `docs/modeling_final_report.md`
- `docs/frontend_3d_command_center_spec.md`
- `reports/model_summaries/final_modeling_report.md`
- `app_data/production_readiness_report.md`

## Licencia y uso responsable

Proyecto académico orientado a demostrar un flujo completo de datos, modelado, API, visualización y despliegue local. Cualquier uso operativo real requeriría validación adicional, actualización continua de datos, monitorización, trazabilidad de inferencias y contraste con organismos oficiales.
