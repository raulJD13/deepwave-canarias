from pathlib import Path
import argparse
import json
import platform
import os
import subprocess
from datetime import datetime, timezone

try:
    import psutil
except Exception:
    psutil = None


parser = argparse.ArgumentParser()
parser.add_argument("--env", default="local")
args = parser.parse_args()


def run(cmd):
    try:
        return subprocess.check_output(
            cmd,
            shell=True,
            text=True,
            stderr=subprocess.STDOUT,
        ).strip()
    except Exception as e:
        return str(e)


env_name = args.env
out_dir = Path("reports/performance")
out_dir.mkdir(parents=True, exist_ok=True)

data = {
    "env": env_name,
    "created_at": datetime.now(timezone.utc).isoformat(),
    "platform": platform.platform(),
    "system": platform.system(),
    "release": platform.release(),
    "machine": platform.machine(),
    "processor": platform.processor(),
    "python_version": platform.python_version(),
    "cpu_count_logical": os.cpu_count(),
    "cwd": str(Path.cwd()),
    "git_commit": run("git rev-parse --short HEAD"),
    "git_branch": run("git branch --show-current"),
    "disk_usage_project": run("du -sh . 2>/dev/null | cut -f1"),
    "app_data_size": run("du -sh app_data 2>/dev/null | cut -f1"),
    "src_size": run("du -sh src 2>/dev/null | cut -f1"),
    "reports_size": run("du -sh reports 2>/dev/null | cut -f1"),
    "pip_freeze_head": run("python -m pip freeze | head -80"),
}

if psutil:
    mem = psutil.virtual_memory()
    data.update({
        "ram_total_gb": round(mem.total / 1024**3, 2),
        "ram_available_gb": round(mem.available / 1024**3, 2),
        "cpu_count_physical": psutil.cpu_count(logical=False),
        "cpu_count_logical_psutil": psutil.cpu_count(logical=True),
    })

out = out_dir / f"environment_{env_name}.json"
out.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")

print(json.dumps(data, indent=2, ensure_ascii=False))
print(f"\nSaved: {out}")
