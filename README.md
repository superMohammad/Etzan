# اتزان · Etzan

Arabic-first (with English) web app that measures how screen use affects focus and
sleep quality. Six machine-learning models run **entirely inside the browser** via
ONNX — no backend, no database, no account, and no answer ever leaves the device.

A data-science project from Tuwaiq Academy.

---

## What's in here

| Path | What it is |
|---|---|
| `etzan/web/` | The app — React + TypeScript + Vite. This is what gets deployed. |
| `etzan/export/` | Build-time Python that trains the six models and exports them to ONNX. |
| `etzan/SEO-AUDIT.md` | Technical/on-page SEO audit and the record of what was fixed. |
| `*.csv` | The datasets the export pipeline trains on. |
| `assets/brain.svg` | Source artwork for the brain illustration. |

The three tools: a brain-rot check, a sleep-quality check with an ideal-bedtime
recommendation, and a local tracker with a trend view.

---

## Running it locally

```bash
cd etzan/web
npm install
npm run dev        # http://localhost:5173
```

```bash
npm run build      # tsc -b && vite build  →  dist/
npm run preview
```

`npm run build` runs `tsc -b` first, so type errors fail the build. There is no test
or lint script; the type check is the gate.

### Regenerating the models (optional)

The `.onnx` files are committed, so you only need this if you change a feature or a
model. Every estimator is seeded, so the output is reproducible.

```bash
cd etzan/export
python -m venv --system-site-packages .venv
./.venv/bin/pip install skl2onnx onnx onnxruntime
./.venv/bin/python export_onnx.py
```

---

## Deploying to GitHub Pages

Pushing to `main` triggers `.github/workflows/deploy-web.yml`, which builds
`etzan/web` and publishes `dist/`. **Nothing else in this repository is served** —
the datasets and the PDF live in the repo but are never part of the site.

One-time setup: **Settings → Pages → Source → GitHub Actions**.

The workflow handles the two things a single-page app needs on Pages:

- **Base path.** It sets `VITE_BASE=/<repo-name>/` from
  `github.event.repository.name`, so assets and deep links resolve on a project
  site. Nothing is hardcoded, and renaming the repo keeps working.
  For a user site (`<username>.github.io`) or a custom domain, change that env var
  to `/`.
- **Deep links.** Pages has no server-side rewrites, so `/brain` would 404. The
  workflow copies `index.html` to `404.html`, which Pages serves for unknown paths
  and which hands the URL to the client router.

It also generates `robots.txt` and `sitemap.xml` from the real deployed origin —
that's why no domain is hardcoded anywhere in `public/`.

---

## Notes on the data

- `Questionnaire (Responses) - Form Responses 1.csv` contains **481 real survey
  responses**. There are no names or email addresses, but each row carries a
  timestamp plus age, gender, occupation and affiliation. Consider whether you want
  that public before making the repository public.
- `sleep_health_dataset.csv` is ~15 MB and `Label the Brain Presentation…pdf` is
  ~12 MB. Both are well under GitHub's limits, but they dominate the repo size.

---

## Important

Etzan is an educational tool and a project. It is not a medical device and not a
substitute for professional advice. Do not use its results to diagnose a condition
or to stop a treatment. The datasets are cross-sectional and largely self-reported:
they show correlations, not causes.
