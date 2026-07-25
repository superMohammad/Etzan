# اتزان · Etzan

An Arabic-first (English too) web app that measures how screen use affects your
focus and your sleep.

Everything runs **inside the browser** — no backend, no database, no account, and
no answer ever leaves the device.

A data-science project from Tuwaiq Academy.

---

## Quick start

```bash
cd etzan/web
npm install
npm run dev        # http://localhost:5173
```

| Command | What it does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check, then build to `dist/` |
| `npm run preview` | Serve the built `dist/` |

There is no test or lint script. `npm run build` runs `tsc -b` first, so **type
errors fail the build** — that is the gate.

---

## The three tools

| Tool | Route | What it does |
|---|---|---|
| Brain-rot check | `/brain` | Estimates how your app habits relate to focus and mood |
| Sleep check | `/sleep` | Estimates sleep quality and suggests an ideal bedtime |
| Daily tracker | `/dashboard` | Log a day, see your trend, project it forward |

The two checks run machine-learning models. **The tracker does not** — its score
and its forecast line are plain arithmetic over what you typed.

---

## What's in the repo

| Path | What it is |
|---|---|
| `etzan/web/` | The app (React + TypeScript + Vite). This is what gets deployed. |
| `etzan/export/` | Python that trains the models and exports them to ONNX. |
| `How-Etzan-Works.pdf` | How the scoring, the ONNX pipeline and the forecast actually work. |
| `etzan/SEO-AUDIT.md` | SEO audit and the record of what was fixed. |
| `*.csv` | The datasets the models train on. |
| `assets/brain.svg` | Source artwork for the brain illustration. |

---

## The models

Six models are trained and committed. **Five are loaded by the app.**
`sleep_quality` is currently unused: the sleep check reads both sides of its
before/after comparison off `bedtime_recommender`, so the two numbers differ by
schedule alone.

Figures are measured on a held-out 20% test set by `etzan/export/export_onnx.py`.
Every estimator is seeded with `RANDOM_STATE = 42`, so re-running reproduces them
exactly rather than approximately.

| Model | Algorithm | Score | Loaded by the app |
|---|---|---|---|
| Brain rot | Logistic Regression | AUC 0.856 | yes |
| Psychological impact | Gradient Boosting | AUC 0.811 | yes |
| Sleep disorder | Random Forest | accuracy 0.865 | yes |
| Waking rested | Logistic Regression | AUC 0.809 | yes |
| Suggested bedtime | Random Forest | R² 0.756 | yes |
| Sleep quality | Random Forest | R² 0.819 | no |

**Why the disorder model isn't the most accurate one available:**
HistGradientBoosting reached 0.95 accuracy but does not convert to ONNX. A Random
Forest at 0.865 ships instead — accuracy traded for running with no server, which
is the whole point of the project.

### Regenerating them (optional)

The `.onnx` files are committed, so you only need this if you change a feature or a
model.

```bash
cd etzan/export
python -m venv --system-site-packages .venv
./.venv/bin/pip install skl2onnx onnx onnxruntime
./.venv/bin/python export_onnx.py
```

---

## Deploying

Push to `main` → `.github/workflows/deploy-web.yml` builds `etzan/web` and
publishes `dist/` to GitHub Pages.

One-time setup: **Settings → Pages → Source → GitHub Actions**.

**Only the built app is served.** The datasets and the PDFs live in the repo but
are never part of the site.

The workflow handles the two things a single-page app needs on Pages:

- **Base path** — it sets `VITE_BASE=/<repo-name>/` from the repository name, so
  nothing is hardcoded and renaming the repo keeps working. For a user site
  (`<username>.github.io`) or a custom domain, change that env var to `/`.
- **Deep links** — Pages has no server-side rewrites, so `/brain` would 404. The
  workflow copies `index.html` to `404.html`, which Pages serves for unknown paths
  and which hands the URL to the client router.

It also generates `robots.txt` and `sitemap.xml` from the real deployed origin,
which is why no domain is hardcoded in `public/`.

---

## Notes on the data

- `Questionnaire (Responses) - Form Responses 1.csv` holds **481 real survey
  responses**. There are no names or email addresses, but each row carries a
  timestamp plus age, gender, occupation and affiliation. Consider that before
  making the repository public.
- `sleep_health_dataset.csv` (~15 MB) and the presentation PDF (~12 MB) dominate
  the repository size. Both are well under GitHub's limits.

---

## Important

Etzan is an educational project, not a medical device. Do not use its results to
diagnose a condition or to change a treatment.

The datasets are cross-sectional and largely self-reported: they show
**correlations, not causes**. The brain-rot score in particular is a rank against
the 481 survey respondents, not a clinical threshold — by the way the scale is
built, half of any group lands on the higher side.
