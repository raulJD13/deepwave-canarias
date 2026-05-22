from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def test_production_code_does_not_reference_training_artifacts() -> None:
    production_files = [
        *sorted((ROOT / "src" / "api").glob("*.py")),
        *[path for path in sorted((ROOT / "frontend").rglob("*")) if path.is_file()],
    ]

    forbidden_fragments = [
        "gold/",
        "silver/",
        "bronze/",
        "models/",
        ".parquet",
        ".pkl",
        ".joblib",
        ".nc",
        ".grib",
    ]

    for path in production_files:
        content = path.read_text(encoding="utf-8").lower()
        for fragment in forbidden_fragments:
            assert fragment not in content, f"{path} references {fragment}"


def test_backend_requirements_keep_runtime_lightweight() -> None:
    requirements = (ROOT / "requirements.txt").read_text(encoding="utf-8").lower()

    required_backend_dependencies = ["fastapi", "uvicorn", "pydantic", "pytest", "httpx"]
    for dependency in required_backend_dependencies:
        assert dependency in requirements

    forbidden_ml_dependencies = [
        "lightgbm",
        "xgboost",
        "scikit-learn",
        "sklearn",
        "pandas",
        "pyarrow",
        "torch",
        "tensorflow",
    ]
    for dependency in forbidden_ml_dependencies:
        assert dependency not in requirements


def test_frontend_documentation_matches_ocean_command_center_direction() -> None:
    docs = [
        ROOT / "AGENTS.md",
        ROOT / "README.md",
        ROOT / "docs" / "frontend_3d_command_center_spec.md",
    ]
    combined_docs = "\n".join(path.read_text(encoding="utf-8") for path in docs if path.exists())

    assert "Ocean Command Center" in combined_docs

    stale_fragments = ["3D Command Center", "Leaflet", "Chart.js", "torus"]
    for fragment in stale_fragments:
        assert fragment not in combined_docs
