# 09 — Reproducibilidad

## Entorno recomendado

```text
Mac M2 Pro
Python 3.11
VS Code / Jupyter
```

## Instalación

```bash
python3.11 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements-mac-m2pro.txt
```

Si LightGBM falla en Mac:

```bash
brew install libomp
python -m pip install lightgbm
```

## Orden final recomendado

```text
14_gold_multitarget_dataset.ipynb
15_model_training_multitarget_physical.ipynb
16_model_training_risk_modules.ipynb
17_model_surf_score.ipynb
18_model_final_report_multitarget.ipynb
19_documentation_pack.ipynb
```
