import shutil
import subprocess
from pathlib import Path

import pytest


ROOT = Path(__file__).resolve().parents[1]
FRONTEND_JS = ROOT / "frontend" / "js"


def test_frontend_javascript_modules_parse_with_node() -> None:
    node = shutil.which("node")
    if node is None:
        pytest.skip("node is not installed")

    js_files = sorted(FRONTEND_JS.glob("*.js"))
    assert js_files

    for js_file in js_files:
        result = subprocess.run(
            [node, "--check", str(js_file)],
            cwd=ROOT,
            capture_output=True,
            text=True,
            check=False,
        )
        assert result.returncode == 0, (
            f"{js_file} has a JavaScript syntax error\n"
            f"STDOUT:\n{result.stdout}\n"
            f"STDERR:\n{result.stderr}"
        )
