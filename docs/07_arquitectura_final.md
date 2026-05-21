# 07 — Arquitectura final

La arquitectura final queda:

```text
Gold multitarget
    ↓
LightGBM físico
    ↓
Predicciones de hs, periodo, viento, dirección y marea
    ↓
Reglas físicas interpretables
    ↓
Riesgo general / playa / navegación / surf score
```

Esta arquitectura es más explicable que entrenar modelos directos sobre etiquetas derivadas por reglas.
