# Resultados multitarget físico — DeepWave Canarias

## Dataset

- Entrada: `/Users/rauljimenez/Development/Projects/AI-Projects/deep-wave-canarias/gold/multitarget_training_dataset`
- Filas: 983,328
- Columnas: 673
- Features usadas: 318
- Horizontes: [3, 6, 12, 24, 48]

## Modelos entrenados

- Modelos escalares LightGBM: 60
- Modelos direccionales sin/cos: 20

## Targets escalares principales


### hs

- +3h: MAE=0.0562, persistencia=0.0888, mejora=36.70%
- +6h: MAE=0.1044, persistencia=0.1548, mejora=32.55%
- +12h: MAE=0.1917, persistencia=0.2542, mejora=24.58%
- +24h: MAE=0.3159, persistencia=0.3865, mejora=18.26%
- +48h: MAE=0.4432, persistencia=0.5392, mejora=17.81%

### tp

- +3h: MAE=0.6255, persistencia=0.4976, mejora=-25.70%
- +6h: MAE=0.9205, persistencia=0.8772, mejora=-4.93%
- +12h: MAE=1.2605, persistencia=1.4067, mejora=10.40%
- +24h: MAE=1.6441, persistencia=1.9561, mejora=15.95%
- +48h: MAE=1.9373, persistencia=2.3944, mejora=19.09%

### tm02

- +3h: MAE=0.2043, persistencia=0.2678, mejora=23.73%
- +6h: MAE=0.3297, persistencia=0.4224, mejora=21.94%
- +12h: MAE=0.4960, persistencia=0.6227, mejora=20.35%
- +24h: MAE=0.7201, persistencia=0.8551, mejora=15.79%
- +48h: MAE=0.9118, persistencia=1.0971, mejora=16.89%

### swell_height

- +3h: MAE=0.1151, persistencia=0.1422, mejora=19.04%
- +6h: MAE=0.1494, persistencia=0.2108, mejora=29.12%
- +12h: MAE=0.2060, persistencia=0.3005, mejora=31.44%
- +24h: MAE=0.3108, persistencia=0.4026, mejora=22.79%
- +48h: MAE=0.4131, persistencia=0.5076, mejora=18.62%

### swell_period

- +3h: MAE=0.8778, persistencia=0.8851, mejora=0.83%
- +6h: MAE=1.0894, persistencia=1.2276, mejora=11.25%
- +12h: MAE=1.3424, persistencia=1.6095, mejora=16.59%
- +24h: MAE=1.6201, persistencia=1.9493, mejora=16.89%
- +48h: MAE=1.8123, persistencia=2.3080, mejora=21.48%

### wind_speed

- +3h: MAE=0.9473, persistencia=1.1068, mejora=14.41%
- +6h: MAE=1.1607, persistencia=1.4068, mejora=17.49%
- +12h: MAE=1.3933, persistencia=1.7073, mejora=18.39%
- +24h: MAE=1.7088, persistencia=2.0036, mejora=14.71%
- +48h: MAE=2.0317, persistencia=2.5046, mejora=18.88%

## Targets direccionales principales


### wave_direction

- +3h: MAE angular=2.49°, persistencia=3.13°, mejora=20.51%
- +6h: MAE angular=4.30°, persistencia=5.29°, mejora=18.74%
- +12h: MAE angular=7.07°, persistencia=8.42°, mejora=16.06%
- +24h: MAE angular=11.33°, persistencia=12.83°, mejora=11.71%
- +48h: MAE angular=17.20°, persistencia=18.86°, mejora=8.78%

### swell_direction

- +3h: MAE angular=10.30°, persistencia=9.53°, mejora=-8.04%
- +6h: MAE angular=12.79°, persistencia=12.97°, mejora=1.39%
- +12h: MAE angular=15.51°, persistencia=16.84°, mejora=7.91%
- +24h: MAE angular=19.49°, persistencia=21.52°, mejora=9.42%
- +48h: MAE angular=24.41°, persistencia=28.20°, mejora=13.42%

### wind_direction

- +3h: MAE angular=17.29°, persistencia=20.19°, mejora=14.34%
- +6h: MAE angular=21.49°, persistencia=25.25°, mejora=14.88%
- +12h: MAE angular=25.69°, persistencia=30.27°, mejora=15.12%
- +24h: MAE angular=31.47°, persistencia=34.63°, mejora=9.13%
- +48h: MAE angular=37.84°, persistencia=42.86°, mejora=11.71%