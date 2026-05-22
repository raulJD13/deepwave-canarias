import stat
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def read_project_file(relative_path: str) -> str:
    return (ROOT / relative_path).read_text(encoding="utf-8")


def test_dockerfile_packages_only_runtime_artifacts() -> None:
    dockerfile = read_project_file("Dockerfile")

    assert dockerfile.startswith("FROM python:3.11-slim")
    assert "WORKDIR /app" in dockerfile
    assert "COPY requirements.txt ." in dockerfile
    assert "pip install -r requirements.txt" in dockerfile
    assert "COPY src ./src" in dockerfile
    assert "COPY app_data ./app_data" in dockerfile
    assert "COPY frontend ./frontend" in dockerfile
    assert "EXPOSE 8000" in dockerfile
    assert '"src.api.main:app"' in dockerfile
    assert '"0.0.0.0"' in dockerfile

    forbidden_fragments = ["COPY gold", "COPY silver", "COPY bronze", "COPY data", "COPY models"]
    for fragment in forbidden_fragments:
        assert fragment not in dockerfile


def test_dockerignore_excludes_heavy_and_local_artifacts() -> None:
    dockerignore = read_project_file(".dockerignore")

    expected_exclusions = [
        ".venv/",
        "__pycache__/",
        ".ipynb_checkpoints/",
        ".git/",
        "data/",
        "bronze/",
        "silver/",
        "gold/",
        "models/",
        "*.parquet",
        "*.pkl",
        "*.joblib",
        "*.nc",
        "*.grib",
        "*.h5",
    ]

    for exclusion in expected_exclusions:
        assert exclusion in dockerignore

    for required_runtime_path in ["src/", "app_data/", "frontend/", "requirements.txt"]:
        assert required_runtime_path not in dockerignore


def test_docker_compose_exposes_api_and_healthcheck() -> None:
    compose = read_project_file("docker-compose.yml")

    assert "deepwave-api:" in compose
    assert "container_name: deepwave-canarias-api" in compose
    assert '"8000:8000"' in compose
    assert "/health" in compose
    assert "dockerfile: Dockerfile" in compose


def test_run_scripts_exist_and_are_executable() -> None:
    expected_scripts = [
        "scripts/run_api.sh",
        "scripts/run_frontend.sh",
        "scripts/run_tests.sh",
        "scripts/run_docker.sh",
    ]

    for relative_path in expected_scripts:
        script = ROOT / relative_path
        assert script.is_file()
        assert script.read_text(encoding="utf-8").startswith("#!/usr/bin/env bash")
        assert script.stat().st_mode & stat.S_IXUSR, f"{relative_path} is not executable"


def test_readme_documents_local_and_docker_execution() -> None:
    readme = read_project_file("README.md")

    assert "## Ejecución local y Docker" in readme
    for fragment in [
        "python -m venv .venv",
        "pip install -r requirements.txt",
        "uvicorn src.api.main:app --reload --host 127.0.0.1 --port 8000",
        "python -m http.server 5500",
        "pytest -q",
        "docker compose up --build",
        "http://127.0.0.1:8000/docs",
        "http://127.0.0.1:5500",
    ]:
        assert fragment in readme
