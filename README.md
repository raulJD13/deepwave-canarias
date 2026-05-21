# DeepWave Canarias

Sistema predictivo de oleaje, viento, marea y riesgo marítimo para zonas costeras de Canarias mediante Inteligencia Artificial y Big Data.

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

## Limitaciones

- Las etiquetas de riesgo y surf son derivadas mediante reglas físicas.
- No se dispone de etiquetas oficiales de incidentes, banderas o valoraciones reales de surfistas.
- El horizonte +48h tiene mayor incertidumbre.
- El sistema es complementario y no sustituye avisos oficiales.
