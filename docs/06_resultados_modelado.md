# 06 — Resultados de modelado

## Resultado destacado de hs

- MAE +24h: 0.3159 m
- MAE +48h: 0.4432 m

## Resultados físicos resumidos

| target | horizon | mae | improvement_pct |
| --- | --- | --- | --- |
| hs | 3 | 0.0562 | 36.7038 |
| hs | 6 | 0.1044 | 32.5518 |
| hs | 12 | 0.1917 | 24.5811 |
| hs | 24 | 0.3159 | 18.2617 |
| hs | 48 | 0.4432 | 17.8079 |
| tm02 | 3 | 0.2043 | 23.7278 |
| tm02 | 6 | 0.3297 | 21.9421 |
| tm02 | 12 | 0.4960 | 20.3526 |
| tm02 | 24 | 0.7201 | 15.7948 |
| tm02 | 48 | 0.9118 | 16.8879 |
| swell_height | 3 | 0.1151 | 19.0411 |
| swell_height | 6 | 0.1494 | 29.1196 |
| swell_height | 12 | 0.2060 | 31.4445 |
| swell_height | 24 | 0.3108 | 22.7934 |
| swell_height | 48 | 0.4131 | 18.6187 |
| wind_speed | 3 | 0.9473 | 14.4112 |
| wind_speed | 6 | 1.1607 | 17.4943 |
| wind_speed | 12 | 1.3933 | 18.3894 |
| wind_speed | 24 | 1.7088 | 14.7115 |
| wind_speed | 48 | 2.0317 | 18.8844 |
| sea_level | 3 | 0.0199 | 96.8764 |
| sea_level | 6 | 0.0341 | 96.3096 |
| sea_level | 12 | 0.0254 | 82.0071 |
| sea_level | 24 | 0.0348 | 81.7401 |
| sea_level | 48 | 0.0533 | 85.6302 |

## Riesgo resumido

| module | horizon | method | score |
| --- | --- | --- | --- |
| beach | 3 | PhysicalDerivedRisk_LGBMPhysical | 0.6901 |
| beach | 6 | PhysicalDerivedRisk_LGBMPhysical | 0.6545 |
| beach | 12 | PhysicalDerivedRisk_LGBMPhysical | 0.5946 |
| beach | 24 | PersistenceRisk | 0.5173 |
| beach | 48 | PersistenceRisk | 0.4288 |
| general | 3 | PhysicalDerivedRisk_LGBMPhysical | 0.9375 |
| general | 6 | PhysicalDerivedRisk_LGBMPhysical | 0.8772 |
| general | 12 | PhysicalDerivedRisk_LGBMPhysical | 0.7591 |
| general | 24 | PersistenceRisk | 0.5738 |
| general | 48 | PersistenceRisk | 0.4404 |
| navigation | 3 | PhysicalDerivedRisk_LGBMPhysical | 0.8529 |
| navigation | 6 | PhysicalDerivedRisk_LGBMPhysical | 0.7960 |
| navigation | 12 | PhysicalDerivedRisk_LGBMPhysical | 0.7023 |
| navigation | 24 | PhysicalDerivedRisk_LGBMPhysical | 0.5800 |
| navigation | 48 | PhysicalDerivedRisk_LGBMPhysical | 0.4701 |

## Surf score resumido

| horizon | recommended | mae | macro_f1_quality |
| --- | --- | --- | --- |
| 3 | CurrentConditionsSurfScore | 0.5797 | 0.7483 |
| 6 | DirectLGBMSurfScore | 0.7234 | 0.6522 |
| 12 | PhysicalDerivedSurfScore | 0.9606 | 0.5476 |
| 24 | PhysicalDerivedSurfScore | 1.2768 | 0.4260 |
| 48 | PhysicalDerivedSurfScore | 1.5654 | 0.3114 |
