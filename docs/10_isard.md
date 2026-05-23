(.venv) isard@isard-Standard-PC-Q35-ICH9-2009:~/Desktop/project/deepwave-canarias$ curl -s htt
p://127.0.0.1:8000/health | python -m json.tool
{
    "status": "ok",
    "service": "DeepWave Canarias API",
    "version": "0.1.0",
    "data_loaded": true,
    "app_data_exists": true,
    "missing_files": [],
    "load_errors": {},
    "valid_horizons": [
        3,
        6,
        12,
        24,
        48
    ]
}
(.venv) isard@isard-Standard-PC-Q35-ICH9-2009:~/Desktop/project/deepwave-canarias$ curl -s http://127.0.0.1:8000/zones | python -m json.tool | head -80
[
    {
        "zona_id": "CAN_EH_PUERTO_DE_LA_ESTACA",
        "name": "Puerto de la Estaca",
        "isla": "El Hierro",
        "latitude": 27.7837,
        "longitude": -17.9045,
        "coords_source": "dataset",
        "coast_orientation_deg": 270.0,
        "coast_exposure_score": 0.4,
        "metadata": {
            "municipio": "Valverde",
            "bathymetry_depth_mean": null,
            "bathymetry_depth_min": null,
            "bathymetry_depth_max": null
        }
    },
    {
        "zona_id": "CAN_FV_GRAN_TARAJAL",
        "name": "Gran Tarajal",
        "isla": "Fuerteventura",
        "latitude": 28.2113,
        "longitude": -14.0195,
        "coords_source": "dataset",
        "coast_orientation_deg": 45.0,
        "coast_exposure_score": 0.8,
        "metadata": {
            "municipio": "Tuineje",
            "bathymetry_depth_mean": null,
            "bathymetry_depth_min": null,
            "bathymetry_depth_max": null
        }
    },
    {
        "zona_id": "CAN_FV_PLAYA_DEL_VALLE",
        "name": "Playa del Valle",
        "isla": "Fuerteventura",
        "latitude": 28.4854,
        "longitude": -14.0943,
        "coords_source": "dataset",
        "coast_orientation_deg": 45.0,
        "coast_exposure_score": 0.8,
        "metadata": {
            "municipio": "Betancuria",
            "bathymetry_depth_mean": null,
            "bathymetry_depth_min": null,
            "bathymetry_depth_max": null
        }
    },
    {
        "zona_id": "CAN_GC_SAN_CRISTOBAL",
        "name": "San Crist\u00f3bal",
        "isla": "Gran Canaria",
        "latitude": 28.0771,
        "longitude": -15.4145,
        "coords_source": "dataset",
        "coast_orientation_deg": 90.0,
        "coast_exposure_score": 0.4,
        "metadata": {
            "municipio": "Las Palmas de Gran Canaria",
            "bathymetry_depth_mean": null,
            "bathymetry_depth_min": null,
            "bathymetry_depth_max": null
        }
    },
    {
        "zona_id": "CAN_LG_ERESES",
        "name": "Ereses",
        "isla": "La Gomera",
        "latitude": 28.0246,
        "longitude": -17.235,
        "coords_source": "dataset",
        "coast_orientation_deg": 270.0,
        "coast_exposure_score": 0.4,
        "metadata": {
            "municipio": "Alajer\u00f3",
            "bathymetry_depth_mean": null,
            "bathymetry_depth_min": null,
            "bathymetry_depth_max": null
        }
(.venv) isard@isard-Standard-PC-Q35-ICH9-2009:~/Desktop/project/deepwave-canarias$ curl -s http://127.0.0.1:8000/model/summary | python -m json.tool | head -80
{
    "project": "DeepWave Canarias",
    "version": "production_artifacts_v1",
    "created_at": "2026-05-21T10:53:24.659299+00:00",
    "source_split": "test",
    "description": "Artefactos ligeros para servir predicciones mar\u00edtimas, riesgo y surf score desde FastAPI y dashboard web.",
    "data_sources": {
        "physical_predictions": "gold/model_results/multitarget_physical/predictions_val_test_core_targets.parquet",
        "final_results": "gold/model_results/final_report_multitarget",
        "gold_multitarget": "gold/multitarget_training_dataset"
    },
    "modeling_blocks": {
        "physical": "LightGBMRegressor por variable y horizonte",
        "risk": "PhysicalDerivedRisk y PersistenceRisk seg\u00fan horizonte/m\u00f3dulo",
        "surf": "PhysicalDerivedSurfScore como arquitectura final"
    },
    "horizons_hours": [
        3,
        6,
        12,
        24,
        48
    ],
    "physical_targets_included": [
        "hs",
        "tp",
        "wave_direction",
        "wind_speed",
        "wind_direction"
    ],
    "zones_count": 14,
    "predictions_count": 70,
    "metrics_highlights": {
        "hs_mae_24h": 0.3159,
        "hs_mae_48h": 0.4432,
        "risk_general_score_24h": 0.5738,
        "surf_score_mae_24h": 1.2768
    },
    "important_note": "Predicciones de demo precalculadas desde el conjunto test/validaci\u00f3n. Para producci\u00f3n real se conectar\u00eda la API al pipeline de inferencia actualizado."
}
(.venv) isard@isard-Standard-PC-Q35-ICH9-2009:~/Desktop/project/deepwave-canarias$ curl -s "http://127.0.0.1:8000/
predict/all?horizon=24" | python -m json.tool | head -80
[
    {
        "zona_id": "CAN_EH_PUERTO_DE_LA_ESTACA",
        "zone_name": "Puerto de la Estaca",
        "isla": "El Hierro",
        "horizon_hours": 24,
        "physical": {
            "hs": 2.0134,
            "tm02": null,
            "tp": 13.2686,
            "period": 13.2686,
            "swell_height": null,
            "swell_period": null,
            "wave_direction": null,
            "swell_direction": null,
            "wind_speed": null,
            "wind_direction": null,
            "sea_level": null,
            "daily_tidal_range": null,
            "wind_wave_height": null
        },
        "risk_general": {
            "label": "high",
            "label_es": "alto",
            "color": "#e67e22",
            "level": 2
        },
        "risk_beach": {
            "label": "high",
            "label_es": "alto",
            "color": "#e67e22",
            "level": 2
        },
        "risk_navigation": {
            "label": "extreme",
            "label_es": "extremo",
            "color": "#e74c3c",
            "level": 3
        },
        "surf": {
            "score": 8.0,
            "quality": "epic",
            "quality_es": "excelente",
            "color": "#9b59b6"
        },
        "recommendation": "Riesgo alto para playa. Precauci\u00f3n especial con oleaje y corrientes. Navegaci\u00f3n ligera no recomendable. Condiciones favorables para surf en zonas adecuadas. Resumen f\u00edsico: ola 2.01 m, periodo 13.3 s. DeepWave Canarias es una herramienta complementaria y no sustituye avisos oficiales.",
        "base_time": "2025-12-29T23:00:00+00:00",
        "valid_time": "2025-12-30T23:00:00+00:00",
        "quality": {
            "source": "precomputed_model_predictions",
            "split": "test",
            "is_demo_forecast": true
        },
        "hs": 2.0134,
        "period": 13.2686,
        "wind_speed": null
    },
    {
        "zona_id": "CAN_FV_GRAN_TARAJAL",
        "zone_name": "Gran Tarajal",
        "isla": "Fuerteventura",
        "horizon_hours": 24,
        "physical": {
            "hs": 0.4396,
            "tm02": null,
            "tp": 10.1873,
            "period": 10.1873,
            "swell_height": null,
            "swell_period": null,
            "wave_direction": null,
            "swell_direction": null,
            "wind_speed": null,
            "wind_direction": null,
            "sea_level": null,
            "daily_tidal_range": null,
            "wind_wave_height": null
        },
        "risk_general": {
            "label": "low",
            "label_es": "bajo",
(.venv) isard@isard-Standard-PC-Q35-ICH9-2009:~/Desktop/project/deepwave-canarias$ 


en pytest -q

(.venv) isard@isard-Standard-PC-Q35-ICH9-2009:~/Desktop/project/deepwave-canarias$ pytest -q
............................F...                  [100%]
======================= FAILURES ========================
___ test_frontend_javascript_modules_parse_with_node ____

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
>           assert result.returncode == 0, (
                f"{js_file} has a JavaScript syntax error\n"
                f"STDOUT:\n{result.stdout}\n"
                f"STDERR:\n{result.stderr}"
            )
E           AssertionError: /home/isard/Desktop/project/deepwave-canarias/frontend/js/api.js has a JavaScript syntax error
E             STDOUT:
E             
E             STDERR:
E             (node:20374) Warning: To load an ES module, set "type": "module" in the package.json or use the .mjs extension.
E             (Use `node --trace-warnings ...` to show where the warning was created)
E             /home/isard/Desktop/project/deepwave-canarias/frontend/js/api.js:1
E             import { API_BASE_URL } from "./config.js";
E             ^^^^^^
E             
E             SyntaxError: Cannot use import statement outside a module
E                 at internalCompileFunction (node:internal/vm:73:18)
E                 at wrapSafe (node:internal/modules/cjs/loader:1274:20)
E                 at node:internal/main/check_syntax:84:41
E                 at loadESM (node:internal/process/esm_loader:34:13)
E                 at checkSyntax (node:internal/main/check_syntax:84:21)
E             
E             Node.js v18.19.1
E             
E           assert 1 == 0
E            +  where 1 = CompletedProcess(args=['/usr/bin/node', '--check', '/home/isard/Desktop/project/deepwave-canarias/frontend/js/api.js']...:internal/process/esm_loader:34:13)\n    at checkSyntax (node:internal/main/check_syntax:84:21)\n\nNode.js v18.19.1\n').returncode

tests/test_frontend_js_syntax.py:28: AssertionError
================ short test summary info ================
FAILED tests/test_frontend_js_syntax.py::test_frontend_javascript_modules_parse_with_node - AssertionError: /home/isard/Desktop/project/deepwave...
1 failed, 31 passed in 0.58s
(.venv) isard@isard-Standard-PC-Q35-ICH9-2009:~/Desktop/project/deepwave-canarias$ 