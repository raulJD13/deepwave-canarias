# 05 — Modelos entrenados

## Modelo físico principal

LightGBMRegressor por variable y horizonte.

## Variables direccionales

Se entrenan como:

```text
sin(dirección)
cos(dirección)
```

## Riesgo

Se evaluaron clasificadores directos y riesgo derivado desde predicciones físicas.

## Surf score

Se compararon condiciones actuales, score derivado físico y modelo directo LightGBM.

## Decisión final

La arquitectura final prioriza:

```text
predicción física → reglas interpretables
```
