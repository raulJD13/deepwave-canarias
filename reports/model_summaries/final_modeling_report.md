# DeepWave Canarias — Informe final de modelado


## 1. Objetivo del modelado


El objetivo del modelado es predecir el estado marítimo futuro en zonas costeras de Canarias a horizontes de +3h, +6h, +12h, +24h y +48h. El sistema predice variables físicas como altura de ola, periodo, dirección del oleaje, viento y marea, y a partir de ellas deriva indicadores operativos de riesgo y calidad de surf.


## 2. Bloques de modelos ejecutados


| block                | notebook                                     | main_output                                                                                                    |   models_or_entries | details                                 | status   |
|:---------------------|:---------------------------------------------|:---------------------------------------------------------------------------------------------------------------|--------------------:|:----------------------------------------|:---------|
| physical_multitarget | 15_model_training_multitarget_physical.ipynb | /Users/rauljimenez/Development/Projects/AI-Projects/deep-wave-canarias/gold/model_results/multitarget_physical |                  80 | scalar_entries=60, direction_entries=20 | OK       |
| risk_modules         | 16_model_training_risk_modules.ipynb         | /Users/rauljimenez/Development/Projects/AI-Projects/deep-wave-canarias/gold/model_results/risk_modules         |                  15 | {"LightGBMClassifier": 15}              | OK       |
| surf_score           | 17_model_surf_score.ipynb                    | /Users/rauljimenez/Development/Projects/AI-Projects/deep-wave-canarias/gold/model_results/surf_score           |                   5 | DirectLGBMSurfScore entries             | OK       |


## 3. Resultados físicos principales


El bloque físico se basa en modelos LightGBM por variable y horizonte. Las variables direccionales se modelan mediante componentes seno/coseno para respetar su naturaleza circular.


### Variables escalares


| target_name             |   horizon_hours |   mae_model |   mae_persistence |   mae_improvement_pct |   r2_model |   corr_model | recommended_use   |
|:------------------------|----------------:|------------:|------------------:|----------------------:|-----------:|-------------:|:------------------|
| current_speed           |               3 |  0.0690777  |        0.0543856  |            -27.0146   |   0.430773 |     0.773959 | not_priority      |
| current_speed           |               6 |  0.0760976  |        0.0807424  |              5.7526   |   0.345011 |     0.661373 | not_priority      |
| current_speed           |              12 |  0.0787438  |        0.0840321  |              6.2932   |   0.27565  |     0.664425 | not_priority      |
| current_speed           |              24 |  0.0842859  |        0.055324   |            -52.3496   |   0.164922 |     0.632654 | not_priority      |
| current_speed           |              48 |  0.0722577  |        0.0760508  |              4.9875   |   0.311978 |     0.55978  | not_priority      |
| daily_tidal_range       |               3 |  0.00939331 |        0.0205122  |             54.2062   |   0.997865 |     0.998932 | main              |
| daily_tidal_range       |               6 |  0.0159162  |        0.0409936  |             61.174    |   0.995459 |     0.997727 | main              |
| daily_tidal_range       |              12 |  0.0316222  |        0.0820401  |             61.4552   |   0.989311 |     0.994665 | main              |
| daily_tidal_range       |              24 |  0.0556227  |        0.164146   |             66.114    |   0.977793 |     0.988914 | main              |
| daily_tidal_range       |              48 |  0.0927227  |        0.313401   |             70.414    |   0.941688 |     0.971219 | main              |
| hs                      |               3 |  0.0562254  |        0.0888291  |             36.7038   |   0.985716 |     0.992936 | main              |
| hs                      |               6 |  0.104417   |        0.15481    |             32.5518   |   0.960696 |     0.980456 | main              |
| hs                      |              12 |  0.191711   |        0.254195   |             24.5811   |   0.880278 |     0.93923  | main              |
| hs                      |              24 |  0.315906   |        0.386484   |             18.2617   |   0.691205 |     0.833223 | main              |
| hs                      |              48 |  0.443219   |        0.539247   |             17.8079   |   0.448768 |     0.674125 | main              |
| sea_level               |               3 |  0.0198898  |        0.636768   |             96.8764   |   0.997369 |     0.998687 | main              |
| sea_level               |               6 |  0.0340981  |        0.923972   |             96.3096   |   0.9901   |     0.995042 | main              |
| sea_level               |              12 |  0.0253526  |        0.140903   |             82.0071   |   0.992242 |     0.996204 | main              |
| sea_level               |              24 |  0.0347841  |        0.190494   |             81.7401   |   0.982718 |     0.99176  | main              |
| sea_level               |              48 |  0.053327   |        0.371106   |             85.6302   |   0.979191 |     0.990343 | main              |
| sea_surface_salinity    |               3 |  0.0342192  |        0.00313852 |           -990.299    |  -0.59263  |     0.658662 | not_priority      |
| sea_surface_salinity    |               6 |  0.0400232  |        0.00595668 |           -571.904    |  -1.20962  |     0.615386 | not_priority      |
| sea_surface_salinity    |              12 |  0.0467798  |        0.011123   |           -320.566    |  -0.620182 |     0.574621 | not_priority      |
| sea_surface_salinity    |              24 |  0.0543942  |        0.0210249  |           -158.714    |   0.480933 |     0.710692 | not_priority      |
| sea_surface_salinity    |              48 |  0.0520584  |        0.0337908  |            -54.0609   |   0.537377 |     0.754272 | not_priority      |
| sea_surface_temperature |               3 |  0.0772224  |        0.073119   |             -5.61196  |   0.99334  |     0.997068 | not_priority      |
| sea_surface_temperature |               6 |  0.10384    |        0.127647   |             18.6509   |   0.988015 |     0.994753 | not_priority      |
| sea_surface_temperature |              12 |  0.143      |        0.176009   |             18.7541   |   0.977673 |     0.990344 | not_priority      |
| sea_surface_temperature |              24 |  0.16279    |        0.129707   |            -25.5055   |   0.969684 |     0.986053 | not_priority      |
| sea_surface_temperature |              48 |  0.203056   |        0.192159   |             -5.67089  |   0.958902 |     0.980357 | not_priority      |
| swell_height            |               3 |  0.115089   |        0.142158   |             19.0411   |   0.943452 |     0.971413 | main              |
| swell_height            |               6 |  0.149421   |        0.210807   |             29.1196   |   0.915735 |     0.957277 | main              |
| swell_height            |              12 |  0.206005   |        0.300493   |             31.4445   |   0.842823 |     0.919152 | main              |
| swell_height            |              24 |  0.310799   |        0.402556   |             22.7934   |   0.654686 |     0.811163 | main              |
| swell_height            |              48 |  0.413116   |        0.50763    |             18.6187   |   0.428118 |     0.66178  | main              |
| swell_period            |               3 |  0.877769   |        0.885145   |              0.833274 |   0.734538 |     0.857174 | main              |
| swell_period            |               6 |  1.08943    |        1.22758    |             11.2541   |   0.646488 |     0.804182 | main              |
| swell_period            |              12 |  1.34243    |        1.60951    |             16.5937   |   0.520939 |     0.721881 | main              |
| swell_period            |              24 |  1.62007    |        1.94926    |             16.8876   |   0.379202 |     0.616823 | main              |
| swell_period            |              48 |  1.81226    |        2.30805    |             21.4806   |   0.278578 |     0.5337   | main              |


### Variables direccionales


| target_name       |   horizon_hours |   angular_mae_model |   angular_mae_persistence |   angular_mae_improvement_pct |   within_30deg_model | recommended_use   |
|:------------------|----------------:|--------------------:|--------------------------:|------------------------------:|---------------------:|:------------------|
| current_direction |               3 |            22.0132  |                  30.7388  |                      28.3863  |              78.2589 | experimental      |
| current_direction |               6 |            35.5319  |                  50.0013  |                      28.9381  |              60.751  | experimental      |
| current_direction |              12 |            41.3814  |                  52.852   |                      21.7032  |              54.5286 | experimental      |
| current_direction |              24 |            26.5236  |                  26.8319  |                       1.14912 |              72.6266 | experimental      |
| current_direction |              48 |            37.5963  |                  38.8369  |                       3.19425 |              58.5539 | experimental      |
| swell_direction   |               3 |            10.2968  |                   9.53058 |                      -8.03937 |              91.3674 | secondary         |
| swell_direction   |               6 |            12.788   |                  12.9682  |                       1.38962 |              88.5968 | secondary         |
| swell_direction   |              12 |            15.5052  |                  16.8363  |                       7.90641 |              85.2865 | secondary         |
| swell_direction   |              24 |            19.4931  |                  21.5205  |                       9.42043 |              80.1306 | secondary         |
| swell_direction   |              48 |            24.414   |                  28.1984  |                      13.4205  |              73.2203 | secondary         |
| wave_direction    |               3 |             2.48927 |                   3.13162 |                      20.5117  |              99.4255 | main              |
| wave_direction    |               6 |             4.29794 |                   5.28943 |                      18.7448  |              98.6653 | main              |
| wave_direction    |              12 |             7.06529 |                   8.41708 |                      16.0601  |              97.0031 | main              |
| wave_direction    |              24 |            11.3262  |                  12.8285  |                      11.7109  |              93.1486 | main              |
| wave_direction    |              48 |            17.2021  |                  18.858   |                       8.78113 |              85.1997 | main              |
| wind_direction    |               3 |            17.2947  |                  20.19    |                      14.3401  |              84.768  | main              |
| wind_direction    |               6 |            21.4925  |                  25.2504  |                      14.8826  |              79.6844 | main              |
| wind_direction    |              12 |            25.693   |                  30.2692  |                      15.1181  |              74.4491 | main              |
| wind_direction    |              24 |            31.4671  |                  34.6278  |                       9.12756 |              68.5316 | main              |
| wind_direction    |              48 |            37.8379  |                  42.8567  |                      11.7108  |              62.5123 | main              |


### Decisión física final


Se seleccionan como variables físicas principales: hs, tm02, swell_height, swell_period, wave_direction, wind_speed, wind_direction, sea_level, daily_tidal_range. Como variables secundarias quedan: tp, swell_direction, wind_wave_height. No se priorizan como targets finales: sea_surface_salinity, current_speed, sea_surface_temperature.


## 4. Resultados de riesgo


Los módulos de riesgo evalúan riesgo general, riesgo de playa/bañistas y riesgo para pequeñas embarcaciones. Se comparan clasificadores directos con baselines de persistencia y riesgo derivado desde predicciones físicas.

| risk_module   |   horizon_hours | recommended_model                |   recommended_score |   recommended_macro_f1 |   recommended_balanced_accuracy |   recommended_recall_class_2 |   recommended_recall_class_3 |
|:--------------|----------------:|:---------------------------------|--------------------:|-----------------------:|--------------------------------:|-----------------------------:|-----------------------------:|
| beach         |               3 | PhysicalDerivedRisk_LGBMPhysical |            0.69013  |               0.773451 |                        0.772548 |                     0.722981 |                     0.471353 |
| beach         |               6 | PhysicalDerivedRisk_LGBMPhysical |            0.654465 |               0.736513 |                        0.733088 |                     0.684337 |                     0.443052 |
| beach         |              12 | PhysicalDerivedRisk_LGBMPhysical |            0.594626 |               0.673901 |                        0.665428 |                     0.638285 |                     0.386644 |
| beach         |              24 | PersistenceRisk                  |            0.517329 |               0.575733 |                        0.570415 |                     0.496512 |                     0.394968 |
| beach         |              48 | PersistenceRisk                  |            0.428847 |               0.476285 |                        0.471018 |                     0.404267 |                     0.335009 |
| general       |               3 | PhysicalDerivedRisk_LGBMPhysical |            0.937471 |               0.945097 |                        0.941164 |                     0.92604  |                     0.929959 |
| general       |               6 | PhysicalDerivedRisk_LGBMPhysical |            0.877195 |               0.895858 |                        0.885385 |                     0.865059 |                     0.850159 |
| general       |              12 | PhysicalDerivedRisk_LGBMPhysical |            0.759051 |               0.802272 |                        0.77776  |                     0.763689 |                     0.67705  |
| general       |              24 | PersistenceRisk                  |            0.573849 |               0.620085 |                        0.619793 |                     0.533913 |                     0.487135 |
| general       |              48 | PersistenceRisk                  |            0.440417 |               0.493495 |                        0.492963 |                     0.3981   |                     0.33895  |
| navigation    |               3 | PhysicalDerivedRisk_LGBMPhysical |            0.852936 |               0.873242 |                        0.870674 |                     0.728989 |                     0.88114  |
| navigation    |               6 | PhysicalDerivedRisk_LGBMPhysical |            0.795999 |               0.81738  |                        0.814086 |                     0.650003 |                     0.835578 |
| navigation    |              12 | PhysicalDerivedRisk_LGBMPhysical |            0.702296 |               0.722798 |                        0.716337 |                     0.517869 |                     0.770208 |
| navigation    |              24 | PhysicalDerivedRisk_LGBMPhysical |            0.580021 |               0.601146 |                        0.590503 |                     0.373613 |                     0.663807 |
| navigation    |              48 | PhysicalDerivedRisk_LGBMPhysical |            0.470063 |               0.500648 |                        0.49031  |                     0.23015  |                     0.550943 |


La arquitectura final prioriza métodos interpretables: predicción física primero y cálculo posterior del riesgo mediante reglas físicas.


## 5. Resultados de surf score


El surf score se formula como un índice físico de 0 a 10 y una categoría de calidad: poor, fair, good, very_good y epic. Se evalúa el score calculado desde condiciones actuales, desde predicciones físicas y mediante un modelo directo LightGBM.

|   horizon_hours | recommended_model          |   recommended_score |   recommended_mae |   recommended_rmse |   recommended_quality_macro_f1 |   recommended_quality_balanced_accuracy |
|----------------:|:---------------------------|--------------------:|------------------:|-------------------:|-------------------------------:|----------------------------------------:|
|               3 | CurrentConditionsSurfScore |            0.775391 |          0.579702 |            1.05135 |                       0.748335 |                                0.752145 |
|               6 | DirectLGBMSurfScore        |            0.698044 |          0.723377 |            1.06088 |                       0.652173 |                                0.64145  |
|              12 | PhysicalDerivedSurfScore   |            0.602685 |          0.960601 |            1.46931 |                       0.547635 |                                0.525511 |
|              24 | PhysicalDerivedSurfScore   |            0.489591 |          1.27675  |            1.84538 |                       0.425966 |                                0.410078 |
|              48 | PhysicalDerivedSurfScore   |            0.387827 |          1.56536  |            2.16187 |                       0.311439 |                                0.318136 |


Aunque el modelo directo puede obtener buenas métricas puntuales, la solución final recomendada es PhysicalDerivedSurfScore, porque conserva la conexión con las predicciones físicas y es más interpretable.


## 6. Arquitectura final seleccionada


La arquitectura final del sistema queda organizada así:

1. Modelos físicos LightGBM predicen variables marítimas y meteorológicas futuras.
2. Las direcciones se predicen como seno/coseno y se reconstruyen a grados.
3. El riesgo general, de playa y de navegación se deriva desde variables físicas usando reglas interpretables.
4. El surf score se calcula desde variables físicas predichas.
5. Los modelos directos de riesgo y surf se conservan como comparativas experimentales.


## 7. Limitaciones


- Las etiquetas de riesgo y surf son derivadas por reglas físicas, no observaciones oficiales de incidentes o valoraciones reales.
- El horizonte +48h presenta mayor incertidumbre.
- El uso de zona_id como feature mejora resultados en zonas conocidas, pero debe tratarse con cuidado si se extrapola a zonas nuevas.
- El sistema debe considerarse una herramienta complementaria y no sustituye avisos oficiales.


## 8. Archivos generados


- Directorio final: `/Users/rauljimenez/Development/Projects/AI-Projects/deep-wave-canarias/gold/model_results/final_report_multitarget`

- Tablas para memoria: `/Users/rauljimenez/Development/Projects/AI-Projects/deep-wave-canarias/reports/tables`

- Figuras para memoria: `/Users/rauljimenez/Development/Projects/AI-Projects/deep-wave-canarias/reports/figures`

- Resúmenes: `/Users/rauljimenez/Development/Projects/AI-Projects/deep-wave-canarias/reports/model_summaries`