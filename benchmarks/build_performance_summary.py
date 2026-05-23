from pathlib import Path
import json
import pandas as pd

perf = Path("reports/performance")
perf.mkdir(parents=True, exist_ok=True)

rows = []

# API benchmarks: ignorar *_raw.csv
for path in sorted(perf.glob("benchmark_api_*.csv")):
    if path.name.endswith("_raw.csv"):
        continue

    df = pd.read_csv(path)

    required = {"env", "endpoint", "requests", "errors", "mean_ms", "p95_ms", "max_ms"}
    missing = required - set(df.columns)

    if missing:
        print(f"SKIP {path.name}: faltan columnas {missing}")
        continue

    rows.append({
        "benchmark_type": "api",
        "env": df["env"].iloc[0],
        "test": "api_endpoints_mean",
        "requests_total": int(df["requests"].sum()),
        "errors_total": int(df["errors"].sum()),
        "mean_latency_ms_avg": round(float(df["mean_ms"].mean()), 4),
        "p95_latency_ms_avg": round(float(df["p95_ms"].mean()), 4),
        "max_latency_ms": round(float(df["max_ms"].max()), 4),
        "rows_loaded": "",
        "n_features": "",
        "train_time_s": "",
        "predict_time_s": "",
        "total_time_s": "",
        "mae": "",
        "rmse": "",
        "r2": "",
        "ram_after_train_mb": "",
    })

# Training benchmarks
for path in sorted(perf.glob("benchmark_training_*.json")):
    data = json.loads(path.read_text(encoding="utf-8"))

    rows.append({
        "benchmark_type": "training",
        "env": data.get("env"),
        "test": "lightgbm_hs_24h",
        "requests_total": "",
        "errors_total": "",
        "mean_latency_ms_avg": "",
        "p95_latency_ms_avg": "",
        "max_latency_ms": "",
        "rows_loaded": data.get("rows_loaded"),
        "n_features": data.get("n_features"),
        "train_time_s": data.get("train_time_s"),
        "predict_time_s": data.get("predict_time_s"),
        "total_time_s": data.get("total_time_s"),
        "mae": data.get("mae"),
        "rmse": data.get("rmse"),
        "r2": data.get("r2"),
        "ram_after_train_mb": data.get("ram_after_train_mb"),
    })

summary = pd.DataFrame(rows)

if not summary.empty:
    summary = summary.sort_values(["benchmark_type", "env", "test"]).reset_index(drop=True)

summary_path = perf / "performance_summary.csv"
summary.to_csv(summary_path, index=False)

def markdown_table(df):
    if df.empty:
        return "_No hay resultados de benchmark._"

    cols = list(df.columns)
    lines = []
    lines.append("| " + " | ".join(cols) + " |")
    lines.append("| " + " | ".join(["---"] * len(cols)) + " |")

    for _, row in df.iterrows():
        values = []
        for c in cols:
            v = row[c]
            if pd.isna(v):
                values.append("")
            elif isinstance(v, float):
                values.append(f"{v:.4f}")
            else:
                values.append(str(v).replace("|", "/"))
        lines.append("| " + " | ".join(values) + " |")

    return "\n".join(lines)

report = f"""# Performance benchmark summary

## Tabla resumen

{markdown_table(summary)}

## Interpretación

Este informe compara el rendimiento de DeepWave Canarias en IsardVDI y Mac M2 Pro.

Se evalúan dos bloques:

1. API de producción basada en app_data/*.json.
2. Entrenamiento reducido representativo usando LightGBM para target_hs_24h.

El entrenamiento completo del sistema no se repite en IsardVDI porque el proyecto final genera múltiples modelos físicos, de riesgo y surf. En su lugar se usa un caso representativo y reproducible: LightGBM para altura significativa de ola a +24h.

Esta prueba es adecuada porque hs es la variable principal del sistema y +24h es uno de los horizontes operativos más importantes.

## Conclusión

La estrategia de producción basada en app_data permite una API ligera, rápida y sin necesidad de cargar datasets Gold ni modelos pesados en tiempo de servicio.
"""

report_path = perf / "performance_report.md"
report_path.write_text(report, encoding="utf-8")

print(summary)
print(f"Saved: {summary_path}")
print(f"Saved: {report_path}")
