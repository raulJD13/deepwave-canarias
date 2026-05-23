from pathlib import Path
import argparse
import json
import time
import platform
import os
import csv
from datetime import datetime, timezone

import numpy as np
import pandas as pd

try:
    import psutil
except Exception:
    psutil = None

try:
    import lightgbm as lgb
except Exception:
    lgb = None


parser = argparse.ArgumentParser()
parser.add_argument("--env", default="local")
parser.add_argument("--data", default="benchmarks/data/benchmark_hs_24h_sample.csv")
parser.add_argument("--target", default="target_hs_24h")
parser.add_argument("--num-boost-round", type=int, default=250)
parser.add_argument("--seed", type=int, default=42)
args = parser.parse_args()

out_dir = Path("reports/performance")
out_dir.mkdir(parents=True, exist_ok=True)

data_path = Path(args.data)

if not data_path.exists():
    raise FileNotFoundError(f"No existe dataset de benchmark: {data_path}")

if lgb is None:
    raise ImportError(
        "No se pudo importar lightgbm. Instala con: pip install lightgbm"
    )


def rss_mb():
    if psutil is None:
        return None
    return round(psutil.Process(os.getpid()).memory_info().rss / 1024 / 1024, 2)


def rmse(y_true, y_pred):
    return float(np.sqrt(np.mean((y_true - y_pred) ** 2)))


def mae(y_true, y_pred):
    return float(np.mean(np.abs(y_true - y_pred)))


def r2_score_manual(y_true, y_pred):
    denom = np.sum((y_true - np.mean(y_true)) ** 2)
    if denom == 0:
        return None
    return float(1 - np.sum((y_true - y_pred) ** 2) / denom)


def make_features(df, target):
    work = df.copy()

    if target not in work.columns:
        raise ValueError(f"No existe target {target} en dataset.")

    # Eliminar filas sin target.
    work = work.dropna(subset=[target]).reset_index(drop=True)

    # Crear features temporales si timestamp existe.
    if "timestamp" in work.columns:
        ts = pd.to_datetime(work["timestamp"], errors="coerce", utc=True)
        work["bench_hour"] = ts.dt.hour
        work["bench_month"] = ts.dt.month
        work["bench_dayofweek"] = ts.dt.dayofweek
        work = work.drop(columns=["timestamp"])

    y = pd.to_numeric(work[target], errors="coerce")
    work = work.drop(columns=[target])

    # Quitar otros targets para evitar leakage.
    drop_cols = [c for c in work.columns if c.startswith("target_")]
    if drop_cols:
        work = work.drop(columns=drop_cols)

    # Quitar columnas booleanas/flags de entrenabilidad si existen.
    drop_cols = [
        c for c in work.columns
        if c.startswith("is_trainable_") or c.endswith("_flag")
    ]
    if drop_cols:
        work = work.drop(columns=drop_cols)

    # Separar split.
    split = work["split"].astype(str) if "split" in work.columns else None
    if "split" in work.columns:
        work = work.drop(columns=["split"])

    # One-hot de pocas categóricas.
    categorical_cols = [
        c for c in ["zona_id", "isla"]
        if c in work.columns
    ]

    for c in categorical_cols:
        work[c] = work[c].astype(str).fillna("UNKNOWN")

    if categorical_cols:
        work = pd.get_dummies(work, columns=categorical_cols, dummy_na=False)

    # Convertir todo a numérico.
    for c in work.columns:
        work[c] = pd.to_numeric(work[c], errors="coerce")

    # Eliminar columnas totalmente nulas.
    work = work.dropna(axis=1, how="all")

    # Rellenar nulos con mediana.
    medians = work.median(numeric_only=True)
    work = work.fillna(medians).fillna(0.0)

    valid = y.notna()
    X = work.loc[valid].astype("float32")
    y = y.loc[valid].astype("float32")

    if split is not None:
        split = split.loc[valid].reset_index(drop=True)
    X = X.reset_index(drop=True)
    y = y.reset_index(drop=True)

    return X, y, split


result = {
    "env": args.env,
    "created_at": datetime.now(timezone.utc).isoformat(),
    "platform": platform.platform(),
    "python_version": platform.python_version(),
    "cpu_count_logical": os.cpu_count(),
    "data_path": str(data_path),
    "target": args.target,
    "num_boost_round": args.num_boost_round,
    "seed": args.seed,
    "ram_start_mb": rss_mb(),
}

t0_total = time.perf_counter()

t0 = time.perf_counter()
df = pd.read_csv(data_path)
result["load_time_s"] = round(time.perf_counter() - t0, 4)
result["rows_loaded"] = int(len(df))
result["cols_loaded"] = int(df.shape[1])
result["dataset_size_mb"] = round(data_path.stat().st_size / 1024 / 1024, 3)
result["ram_after_load_mb"] = rss_mb()

t0 = time.perf_counter()
X, y, split = make_features(df, args.target)
result["prep_time_s"] = round(time.perf_counter() - t0, 4)
result["rows_after_clean"] = int(len(X))
result["n_features"] = int(X.shape[1])
result["ram_after_prep_mb"] = rss_mb()

if split is not None and set(split.unique()) & {"train", "val", "test"}:
    train_mask = split.isin(["train", "val"])
    test_mask = split == "test"

    if train_mask.sum() < 100 or test_mask.sum() < 100:
        # Fallback 80/20 temporal/ordenado.
        n = len(X)
        cut = int(n * 0.8)
        train_mask = pd.Series([True] * cut + [False] * (n - cut))
        test_mask = ~train_mask
else:
    n = len(X)
    cut = int(n * 0.8)
    train_mask = pd.Series([True] * cut + [False] * (n - cut))
    test_mask = ~train_mask

X_train = X.loc[train_mask].reset_index(drop=True)
y_train = y.loc[train_mask].reset_index(drop=True)
X_test = X.loc[test_mask].reset_index(drop=True)
y_test = y.loc[test_mask].reset_index(drop=True)

result["train_rows"] = int(len(X_train))
result["test_rows"] = int(len(X_test))

if len(X_train) == 0 or len(X_test) == 0:
    raise RuntimeError("Train/test vacío. Revisa split o dataset.")

params = {
    "objective": "regression",
    "metric": ["l1", "rmse"],
    "learning_rate": 0.05,
    "num_leaves": 31,
    "feature_fraction": 0.9,
    "bagging_fraction": 0.9,
    "bagging_freq": 1,
    "min_data_in_leaf": 30,
    "num_threads": -1,
    "verbosity": -1,
    "seed": args.seed,
}

train_data = lgb.Dataset(X_train, label=y_train)
valid_data = lgb.Dataset(X_test, label=y_test, reference=train_data)

t0 = time.perf_counter()
model = lgb.train(
    params,
    train_data,
    num_boost_round=args.num_boost_round,
    valid_sets=[valid_data],
    valid_names=["test"],
    callbacks=[
        lgb.log_evaluation(period=0),
    ],
)
result["train_time_s"] = round(time.perf_counter() - t0, 4)
result["ram_after_train_mb"] = rss_mb()

t0 = time.perf_counter()
pred = model.predict(X_test)
result["predict_time_s"] = round(time.perf_counter() - t0, 4)
result["ram_after_predict_mb"] = rss_mb()

y_test_np = y_test.to_numpy(dtype=float)
pred_np = np.asarray(pred, dtype=float)

result["mae"] = round(mae(y_test_np, pred_np), 6)
result["rmse"] = round(rmse(y_test_np, pred_np), 6)
r2 = r2_score_manual(y_test_np, pred_np)
result["r2"] = round(r2, 6) if r2 is not None else None

baseline_pred = np.full_like(y_test_np, float(np.mean(y_train)))
result["baseline_mae_mean_train"] = round(mae(y_test_np, baseline_pred), 6)

if result["baseline_mae_mean_train"] and result["baseline_mae_mean_train"] > 0:
    result["mae_improvement_vs_mean_baseline_pct"] = round(
        100 * (result["baseline_mae_mean_train"] - result["mae"]) / result["baseline_mae_mean_train"],
        4,
    )
else:
    result["mae_improvement_vs_mean_baseline_pct"] = None

result["total_time_s"] = round(time.perf_counter() - t0_total, 4)

json_path = out_dir / f"benchmark_training_{args.env}.json"
csv_path = out_dir / f"benchmark_training_{args.env}.csv"

json_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")

with csv_path.open("w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=list(result.keys()))
    writer.writeheader()
    writer.writerow(result)

print(json.dumps(result, indent=2, ensure_ascii=False))
print(f"\nSaved: {json_path}")
print(f"Saved: {csv_path}")
