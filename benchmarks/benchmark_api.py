from pathlib import Path
from urllib.request import urlopen, Request
from urllib.error import HTTPError, URLError
from datetime import datetime, timezone
import json, time, statistics, csv, argparse

parser = argparse.ArgumentParser()
parser.add_argument("--env", default="isardvdi")
parser.add_argument("--base-url", default="http://127.0.0.1:8000")
parser.add_argument("--requests", type=int, default=50)
args = parser.parse_args()

base = args.base_url.rstrip("/")
out_dir = Path("reports/performance")
out_dir.mkdir(parents=True, exist_ok=True)

def get_json(path):
    url = base + path
    req = Request(url, headers={"User-Agent": "DeepWaveBenchmark/1.0"})
    with urlopen(req, timeout=10) as r:
        raw = r.read().decode("utf-8")
        return json.loads(raw)

def timed_request(path):
    url = base + path
    req = Request(url, headers={"User-Agent": "DeepWaveBenchmark/1.0"})
    t0 = time.perf_counter()
    try:
        with urlopen(req, timeout=10) as r:
            r.read()
            status = r.status
            ok = 200 <= status < 300
    except HTTPError as e:
        status = e.code
        ok = False
    except URLError:
        status = None
        ok = False
    dt_ms = (time.perf_counter() - t0) * 1000
    return dt_ms, status, ok

# Obtener una zona válida.
zones_payload = get_json("/zones")
if isinstance(zones_payload, dict):
    zones = zones_payload.get("zones") or zones_payload.get("data") or []
else:
    zones = zones_payload

if not zones:
    raise RuntimeError("No zones returned by /zones")

first_zone = zones[0]
zona_id = first_zone.get("zona_id") or first_zone.get("id")
if not zona_id:
    raise RuntimeError("Could not infer zona_id from /zones")

endpoints = [
    "/health",
    "/zones",
    "/model/summary",
    "/legends/risk",
    "/legends/surf",
    "/examples",
    "/predict/all?horizon=24",
    f"/predict/{zona_id}",
    f"/predict/{zona_id}?horizon=24",
    f"/risk/{zona_id}",
    f"/surf/{zona_id}",
]

summary = []
raw_rows = []

for path in endpoints:
    times = []
    statuses = []
    oks = 0

    for i in range(args.requests):
        dt, status, ok = timed_request(path)
        times.append(dt)
        statuses.append(status)
        oks += int(ok)
        raw_rows.append({
            "env": args.env,
            "endpoint": path,
            "iteration": i + 1,
            "latency_ms": round(dt, 4),
            "status": status,
            "ok": ok,
        })

    times_sorted = sorted(times)
    p95 = times_sorted[int(0.95 * (len(times_sorted) - 1))]

    summary.append({
        "env": args.env,
        "endpoint": path,
        "requests": args.requests,
        "ok": oks,
        "errors": args.requests - oks,
        "min_ms": round(min(times), 4),
        "mean_ms": round(statistics.mean(times), 4),
        "median_ms": round(statistics.median(times), 4),
        "p95_ms": round(p95, 4),
        "max_ms": round(max(times), 4),
        "statuses": sorted(set(str(s) for s in statuses)),
    })

result = {
    "env": args.env,
    "base_url": base,
    "created_at": datetime.now(timezone.utc).isoformat(),
    "requests_per_endpoint": args.requests,
    "zona_id_used": zona_id,
    "summary": summary,
}

json_path = out_dir / f"benchmark_api_{args.env}.json"
csv_path = out_dir / f"benchmark_api_{args.env}.csv"
raw_csv_path = out_dir / f"benchmark_api_{args.env}_raw.csv"

json_path.write_text(json.dumps(result, indent=2, ensure_ascii=False), encoding="utf-8")

with csv_path.open("w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=list(summary[0].keys()))
    writer.writeheader()
    writer.writerows(summary)

with raw_csv_path.open("w", newline="", encoding="utf-8") as f:
    writer = csv.DictWriter(f, fieldnames=list(raw_rows[0].keys()))
    writer.writeheader()
    writer.writerows(raw_rows)

print(json.dumps(result, indent=2, ensure_ascii=False))
print(f"\nSaved: {json_path}")
print(f"Saved: {csv_path}")
print(f"Saved: {raw_csv_path}")
