from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt

perf = Path("reports/performance")
fig_dir = perf / "figures"
fig_dir.mkdir(parents=True, exist_ok=True)

summary_path = perf / "performance_summary.csv"

if not summary_path.exists():
    raise FileNotFoundError("No existe reports/performance/performance_summary.csv")

df = pd.read_csv(summary_path)

# ---------------------------------------------------------------------
# 1. API latency: mean vs p95
# ---------------------------------------------------------------------
api = df[df["benchmark_type"] == "api"].copy()

if not api.empty:
    api = api.sort_values("env")

    x = range(len(api))
    width = 0.35

    fig, ax = plt.subplots(figsize=(9, 5))
    ax.bar([i - width / 2 for i in x], api["mean_latency_ms_avg"], width, label="Latencia media")
    ax.bar([i + width / 2 for i in x], api["p95_latency_ms_avg"], width, label="Latencia p95")

    ax.set_title("Latencia API por entorno")
    ax.set_xlabel("Entorno")
    ax.set_ylabel("Latencia (ms)")
    ax.set_xticks(list(x))
    ax.set_xticklabels(api["env"])
    ax.legend()
    ax.grid(axis="y", alpha=0.3)

    fig.tight_layout()
    out = fig_dir / "performance_api_latency.png"
    fig.savefig(out, dpi=160)
    plt.close(fig)
    print("Saved:", out)

# ---------------------------------------------------------------------
# 2. Training time
# ---------------------------------------------------------------------
training = df[df["benchmark_type"] == "training"].copy()

if not training.empty:
    training = training.sort_values("env")

    x = range(len(training))
    width = 0.25

    fig, ax = plt.subplots(figsize=(9, 5))
    ax.bar([i - width for i in x], training["train_time_s"], width, label="Entrenamiento")
    ax.bar(list(x), training["predict_time_s"], width, label="Predicción")
    ax.bar([i + width for i in x], training["total_time_s"], width, label="Tiempo total")

    ax.set_title("Benchmark reducido LightGBM hs +24h")
    ax.set_xlabel("Entorno")
    ax.set_ylabel("Tiempo (s)")
    ax.set_xticks(list(x))
    ax.set_xticklabels(training["env"])
    ax.legend()
    ax.grid(axis="y", alpha=0.3)

    fig.tight_layout()
    out = fig_dir / "performance_training_time.png"
    fig.savefig(out, dpi=160)
    plt.close(fig)
    print("Saved:", out)

# ---------------------------------------------------------------------
# 3. Training metrics
# ---------------------------------------------------------------------
if not training.empty:
    x = range(len(training))
    width = 0.25

    fig, ax = plt.subplots(figsize=(9, 5))
    ax.bar([i - width for i in x], training["mae"], width, label="MAE")
    ax.bar(list(x), training["rmse"], width, label="RMSE")
    ax.bar([i + width for i in x], training["r2"], width, label="R²")

    ax.set_title("Métricas del benchmark de entrenamiento")
    ax.set_xlabel("Entorno")
    ax.set_ylabel("Valor métrico")
    ax.set_xticks(list(x))
    ax.set_xticklabels(training["env"])
    ax.legend()
    ax.grid(axis="y", alpha=0.3)

    fig.tight_layout()
    out = fig_dir / "performance_training_metrics.png"
    fig.savefig(out, dpi=160)
    plt.close(fig)
    print("Saved:", out)

# ---------------------------------------------------------------------
# 4. RAM after training
# ---------------------------------------------------------------------
if not training.empty and "ram_after_train_mb" in training.columns:
    fig, ax = plt.subplots(figsize=(8, 5))
    ax.bar(training["env"], training["ram_after_train_mb"])

    ax.set_title("Memoria RSS tras entrenamiento")
    ax.set_xlabel("Entorno")
    ax.set_ylabel("Memoria (MB)")
    ax.grid(axis="y", alpha=0.3)

    fig.tight_layout()
    out = fig_dir / "performance_training_ram.png"
    fig.savefig(out, dpi=160)
    plt.close(fig)
    print("Saved:", out)

# ---------------------------------------------------------------------
# 5. Append figures section to markdown report
# ---------------------------------------------------------------------
report_path = perf / "performance_report.md"

figures_section = """
## Figuras generadas

- `reports/performance/figures/performance_api_latency.png`
- `reports/performance/figures/performance_training_time.png`
- `reports/performance/figures/performance_training_metrics.png`
- `reports/performance/figures/performance_training_ram.png`

Estas figuras resumen visualmente la comparación entre IsardVDI y Mac M2 Pro para la API y para el benchmark reducido de entrenamiento.
"""

if report_path.exists():
    text = report_path.read_text(encoding="utf-8")
    if "## Figuras generadas" not in text:
        report_path.write_text(text.rstrip() + "\n\n" + figures_section.strip() + "\n", encoding="utf-8")
        print("Updated:", report_path)

print("OK: performance figures generated.")
