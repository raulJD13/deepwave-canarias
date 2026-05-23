from pathlib import Path
import argparse
import json
from datetime import datetime, timezone

import numpy as np
import pandas as pd

try:
    import pyarrow.dataset as ds
except Exception as e:
    raise ImportError("Este script necesita pyarrow para leer gold/*.parquet") from e


parser = argparse.ArgumentParser()
parser.add_argument("--input", default="gold/multitarget_training_dataset")
parser.add_argument("--output", default="benchmarks/data/benchmark_hs_24h_sample.csv")
parser.add_argument("--target", default="target_hs_24h")
parser.add_argument("--max-rows", type=int, default=50000)
parser.add_argument("--seed", type=int, default=42)
args = parser.parse_args()

rng = np.random.default_rng(args.seed)

input_path = Path(args.input)
output_path = Path(args.output)
output_path.parent.mkdir(parents=True, exist_ok=True)

if not input_path.exists():
    raise FileNotFoundError(
        f"No existe {input_path}. Ejecuta este export en tu Mac, donde sí tienes gold/."
    )

dataset = ds.dataset(str(input_path), format="parquet", partitioning="hive")
columns = dataset.schema.names

if args.target not in columns:
    raise ValueError(f"No existe target {args.target}. Columnas disponibles: {columns[:50]}")

# Features candidatas: físicas, temporales, geográficas y lags/rollings.
base_candidates = [
    "zona_id", "isla", "timestamp", "split",
    "simar_hs", "simar_hmax", "simar_tp", "simar_tm02",
    "simar_wave_direction", "simar_swell_height", "simar_swell_period",
    "simar_swell_direction", "simar_wind_speed", "simar_wind_direction",
    "aemet_wind_speed", "aemet_temperature_air", "aemet_pressure",
    "aemet_precipitation", "redmar_sea_level", "redmar_daily_tidal_range",
    "latitude", "longitude", "lat", "lon",
    "coast_orientation_deg", "coast_exposure_score",
    "bathymetry_depth_mean", "bathymetry_depth_min", "bathymetry_depth_max",
    "hour", "dayofweek", "month", "year",
    "hour_sin", "hour_cos", "month_sin", "month_cos",
    "dayofyear_sin", "dayofyear_cos",
]

dynamic_patterns = [
    "lag", "rolling", "trend", "diff",
]

selected_features = [c for c in base_candidates if c in columns]

for c in columns:
    lc = c.lower()
    if c.startswith("target_"):
        continue
    if c in selected_features:
        continue
    if any(p in lc for p in dynamic_patterns):
        if any(key in lc for key in ["hs", "tp", "tm02", "wind", "wave", "sea_level"]):
            selected_features.append(c)

# Limitar número de features para benchmark ligero.
# Mantiene primero las más importantes.
max_features = 60
selected_features = selected_features[:max_features]

needed_cols = list(dict.fromkeys(selected_features + [args.target]))
print("Columnas exportadas:", len(needed_cols))
print("Target:", args.target)
print("Features:", len(selected_features))

scanner = dataset.scanner(columns=needed_cols, batch_size=65536)

chunks = []
rows_seen = 0

for batch in scanner.to_batches():
    df = batch.to_pandas()
    rows_seen += len(df)

    df = df.dropna(subset=[args.target])
    if df.empty:
        continue

    # Reducir valores infinitos.
    df = df.replace([np.inf, -np.inf], np.nan)

    # Sample progresivo por batch.
    take_n = min(len(df), max(1000, args.max_rows // 10))
    if len(df) > take_n:
        df = df.sample(n=take_n, random_state=args.seed)

    chunks.append(df)

    current = sum(len(x) for x in chunks)
    if current >= args.max_rows * 3:
        break

if not chunks:
    raise RuntimeError("No se pudo extraer ninguna fila válida para benchmark.")

sample = pd.concat(chunks, ignore_index=True)

if len(sample) > args.max_rows:
    sample = sample.sample(n=args.max_rows, random_state=args.seed).reset_index(drop=True)

# Orden estable.
sort_cols = [c for c in ["split", "zona_id", "timestamp"] if c in sample.columns]
if sort_cols:
    sample = sample.sort_values(sort_cols).reset_index(drop=True)

# Guardar CSV ligero.
sample.to_csv(output_path, index=False)

metadata = {
    "created_at": datetime.now(timezone.utc).isoformat(),
    "input": str(input_path),
    "output": str(output_path),
    "target": args.target,
    "rows_seen_approx": int(rows_seen),
    "rows_exported": int(len(sample)),
    "columns_exported": int(sample.shape[1]),
    "features": selected_features,
    "seed": args.seed,
    "file_size_mb": round(output_path.stat().st_size / 1024 / 1024, 3),
}

meta_path = output_path.with_suffix(".metadata.json")
meta_path.write_text(json.dumps(metadata, indent=2, ensure_ascii=False), encoding="utf-8")

print(json.dumps(metadata, indent=2, ensure_ascii=False))
print(f"\nSaved dataset: {output_path}")
print(f"Saved metadata: {meta_path}")
