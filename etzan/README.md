# اتزان (Etzan)

An Arabic-first web app (with a full English translation) offering three tools — a brain-rot check,
a sleep check, and a balance dashboard — with **all six ML models running fully in the browser**
(ONNX / onnxruntime-web). No backend, no database: tracking is stored as JSON in `localStorage`
with one-click file export/import.

## Layout

```
etzan/
├── export/
│   ├── export_onnx.py      # trains all 6 models, exports ONNX + preprocessing metadata
│   ├── export_models.py    # joblib reference/metrics (reused by export_onnx for the sleep pipeline)
│   └── .venv/              # build-time only (skl2onnx, onnx, onnxruntime, sklearn 1.4.2)
├── web/                    # Vite + React + TS frontend (deploys to GitHub Pages)
│   ├── public/models/      # *.onnx + *.meta.json + sleep_medians.json (served as static assets)
│   └── src/
│       ├── lib/            # onnx, features, compute, scoring, recommendations, forecast, tracking, predict
│       ├── lib/i18n/       # ar + en catalogues; en is type-checked against the ar key set
│       ├── components/     # UI primitives + the SVG illustrations (recoloured by the level scale)
│       └── pages/          # Landing, BrainCheck, SleepCheck, Dashboard, About
└── .github/workflows/      # GitHub Pages deploy (build-only, no secrets)
```

## 1. Export the models (build-time)

```bash
cd export
python -m venv --system-site-packages .venv
./.venv/bin/pip install skl2onnx onnx onnxruntime
./.venv/bin/python export_onnx.py     # writes web/public/models/*
```

Trains and converts. Metrics are measured on a held-out 20% test set; every estimator is seeded,
so re-running reproduces the shipped models exactly. The exploratory notebooks these pipelines came
from are not part of this repository — `export_onnx.py` is the authoritative implementation.

| Model | Algorithm | Metric |
|---|---|---|
| brain_rot | LogisticRegression (overuse target) | AUC 0.856 |
| mental_health | GradientBoosting (`target`) | acc 0.747, AUC 0.811 |
| sleep_quality | RandomForest (lighter) | R² 0.819 |
| sleep_disorder_risk | RandomForest (HGB runner-up; HGB isn't ONNX-convertible) | acc 0.865 |
| felt_rested | LogisticRegression (HGB runner-up) | AUC 0.809 |
| bedtime_recommender | RandomForest (lighter) | R² 0.756 |

Preprocessing runs in TypeScript (`web/src/lib/features.ts`); the brain scalers/PCA are baked into
their ONNX graphs. Total model payload ≈ 7 MB, lazy-loaded per section.

## 2. Run the frontend

```bash
cd web
npm install
npm run dev       # http://localhost:5173
npm run build     # -> dist/ (static, for GitHub Pages)
```

No environment variables. Dashboard logs live in `localStorage`; use the dashboard's
**تصدير JSON / استيراد JSON** buttons to back up or restore a `.json` file.


## Team
محمد المالكي · عبدالرحمن القرشي · غدي ا ل دعبش · ليان الشدوخي
