"""Train all 6 models and export them as ONNX + preprocessing metadata for the
fully client-side app (onnxruntime-web).

Brain models come from firstlook.ipynb (brain_rot_cleaned.csv):
  - mental_health  : GradientBoosting on the distress `target`
  - brain_rot      : LogisticRegression on a NEW overuse target (z-mean -> median)
Sleep models come from sleep_risk.ipynb (sleep_health_dataset.csv):
  - sleep_quality      : RandomForest (retrained lighter)
  - sleep_disorder_risk: HistGradientBoosting (RandomForest fallback if ONNX fails)
  - felt_rested        : HistGradientBoosting (LogisticRegression fallback if ONNX fails)
  - bedtime_recommender: RandomForest rf4 (retrained lighter)

Preprocessing (scaler is baked into the brain graphs; sleep uses get_dummies done
in TS) is described in each <name>.meta.json. Outputs go to web/public/models/.

Run: export/.venv/bin/python export/export_onnx.py
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
import onnxruntime as ort
from sklearn.decomposition import PCA
from sklearn.ensemble import (
    GradientBoostingClassifier,
    HistGradientBoostingClassifier,
    RandomForestClassifier,
    RandomForestRegressor,
)
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, r2_score, roc_auc_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline, make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.utils.class_weight import compute_sample_weight

from export_models import _load_sleep_base, _add_late_features  # reuse sleep pipeline

PROJECT_ROOT: Path = Path(__file__).resolve().parents[2]
MODELS_DIR: Path = Path(__file__).resolve().parents[1] / "web" / "public" / "models"
RANDOM_STATE: int = 42
OPSET: int = 15

DISTRESS = ["depression", "worries", "concentration_difficulty",
            "interest_fluctuation", "sleep_issues", "distractibility"]
OVERUSE = ["daily_time", "aimless_use", "distracted_when_busy",
           "restless_without", "comparison", "seeks_validation"]
DEMO = ["age", "gender", "Student", "Retired"]
PLATFORMS = ["Discord", "Facebook", "Instagram", "Pinterest", "Reddit",
             "Snapchat", "TikTok", "Twitter", "YouTube"]
REL = ["rel_Divorced", "rel_In a relationship", "rel_Married", "rel_Single"]


def _binary_target_from(frame: pd.DataFrame, items: list[str]) -> np.ndarray:
    """firstlook's method: z-score items, row-mean, split at the median."""
    z = StandardScaler().fit_transform(frame[items])
    score = z.mean(axis=1)
    return (score > np.median(score)).astype(int)


def _convert_classifier(model: Pipeline, classifier: Any, n_features: int) -> bytes:
    """Convert a classifier pipeline to ONNX with a plain probability tensor."""
    initial = [("input", FloatTensorType([None, n_features]))]
    onx = convert_sklearn(
        model,
        initial_types=initial,
        options={id(classifier): {"zipmap": False}},
        target_opset=OPSET,
    )
    return onx.SerializeToString()


def _convert_regressor(model: Any, n_features: int) -> bytes:
    initial = [("input", FloatTensorType([None, n_features]))]
    onx = convert_sklearn(model, initial_types=initial, target_opset=OPSET)
    return onx.SerializeToString()


def _write(name: str, onnx_bytes: bytes, meta: dict[str, Any]) -> None:
    (MODELS_DIR / f"{name}.onnx").write_bytes(onnx_bytes)
    (MODELS_DIR / f"{name}.meta.json").write_text(json.dumps(meta, indent=2, ensure_ascii=False))


def _proba_onnx(onnx_bytes: bytes, x: np.ndarray) -> np.ndarray:
    sess = ort.InferenceSession(onnx_bytes, providers=["CPUExecutionProvider"])
    outputs = sess.run(None, {"input": x.astype(np.float32)})
    # zipmap=False -> outputs are [label, probabilities]
    return np.asarray(outputs[1])


def _predict_onnx(onnx_bytes: bytes, x: np.ndarray) -> np.ndarray:
    sess = ort.InferenceSession(onnx_bytes, providers=["CPUExecutionProvider"])
    return np.asarray(sess.run(None, {"input": x.astype(np.float32)})[0]).ravel()


def _categorical_vocab(frame: pd.DataFrame, columns: list[str]) -> dict[str, list[str]]:
    return {c: sorted(frame[c].dropna().astype(str).unique().tolist()) for c in columns}


# --------------------------------------------------------------------------- #
# Brain models (firstlook)
# --------------------------------------------------------------------------- #

def export_brain(report: list[str]) -> None:
    df = pd.read_csv(PROJECT_ROOT / "brain_rot_cleaned.csv").drop(columns=["Unnamed: 0"])
    mh_target = _binary_target_from(df, DISTRESS)
    brain_target = _binary_target_from(df, OVERUSE)

    # Mental-health (GradientBoosting) — notebook's exact features/pipeline.
    mh_features = OVERUSE + DEMO + PLATFORMS + REL
    xm = df[mh_features].astype(float)
    xm_tr, xm_te, ym_tr, ym_te = train_test_split(
        xm, mh_target, test_size=0.2, random_state=RANDOM_STATE, stratify=mh_target
    )
    mh_gb = GradientBoostingClassifier(max_depth=5, max_features="sqrt", random_state=RANDOM_STATE)
    mh_pipe = make_pipeline(StandardScaler(), PCA(n_components=0.95), mh_gb)
    mh_pipe.fit(xm_tr, ym_tr)
    mh_pred = mh_pipe.predict(xm_te)
    mh_proba = mh_pipe.predict_proba(xm_te)[:, 1]
    report.append(f"mental_health (GB)     acc={accuracy_score(ym_te, mh_pred):.3f} "
                  f"auc={roc_auc_score(ym_te, mh_proba):.3f} (nb acc 0.747 auc 0.811)")
    mh_onnx = _convert_classifier(mh_pipe, mh_gb, len(mh_features))
    assert np.max(np.abs(_proba_onnx(mh_onnx, xm_te.values)[:, 1] - mh_proba)) < 1e-3
    _write("mental_health", mh_onnx, {
        "kind": "classifier", "feature_order": mh_features, "encoding": "direct",
        "classes": [0, 1], "positive_index": 1,
    })

    # Brain-rot (LogisticRegression) — new overuse target, symmetric features.
    brain_features = DISTRESS + DEMO + PLATFORMS + REL
    xb = df[brain_features].astype(float)
    xb_tr, xb_te, yb_tr, yb_te = train_test_split(
        xb, brain_target, test_size=0.2, random_state=RANDOM_STATE, stratify=brain_target
    )
    br_lr = LogisticRegression(max_iter=1000, random_state=RANDOM_STATE)
    br_pipe = make_pipeline(StandardScaler(), br_lr)
    br_pipe.fit(xb_tr, yb_tr)
    br_pred = br_pipe.predict(xb_te)
    br_proba = br_pipe.predict_proba(xb_te)[:, 1]
    report.append(f"brain_rot (LogReg)     acc={accuracy_score(yb_te, br_pred):.3f} "
                  f"auc={roc_auc_score(yb_te, br_proba):.3f} (new overuse target)")
    br_onnx = _convert_classifier(br_pipe, br_lr, len(brain_features))
    assert np.max(np.abs(_proba_onnx(br_onnx, xb_te.values)[:, 1] - br_proba)) < 1e-3
    _write("brain_rot", br_onnx, {
        "kind": "classifier", "feature_order": brain_features, "encoding": "direct",
        "classes": [0, 1], "positive_index": 1,
    })


# --------------------------------------------------------------------------- #
# Sleep models (sleep_risk) — get_dummies encoding done in TS
# --------------------------------------------------------------------------- #

def _encode(frame: pd.DataFrame) -> tuple[pd.DataFrame, list[str]]:
    obj = frame.select_dtypes(include="object").columns.tolist()
    return pd.get_dummies(frame, columns=obj, drop_first=True), obj


def export_sleep(report: list[str]) -> None:
    base = _load_sleep_base()

    # #3 sleep_quality — lighter RandomForest on get_dummies matrix (no Pipeline).
    remove_3 = ["sleep_quality_score", "felt_rested", "sleep_disorder_risk",
                "cognitive_performance_score", "shift_work_status",
                "stress_level", "sleep_duration_level"]
    x3_raw = base.drop(columns=remove_3)
    x3, obj3 = _encode(x3_raw)
    y3 = base["sleep_quality_score"]
    x3_tr, x3_te, y3_tr, y3_te = train_test_split(x3, y3, test_size=0.2, random_state=RANDOM_STATE)
    rf3 = RandomForestRegressor(n_estimators=45, max_depth=16, min_samples_leaf=60,
                                random_state=RANDOM_STATE, n_jobs=-1)
    rf3.fit(x3_tr, y3_tr)
    report.append(f"sleep_quality (RF-lite) R2={r2_score(y3_te, rf3.predict(x3_te)):.3f} (nb 0.828)")
    onnx3 = _convert_regressor(rf3, x3.shape[1])
    assert np.max(np.abs(_predict_onnx(onnx3, x3_te.values) - rf3.predict(x3_te))) < 1e-2
    _write("sleep_quality", onnx3, {
        "kind": "regressor", "encoding": "get_dummies",
        "raw_feature_columns": x3_raw.columns.tolist(),
        "categorical_columns": obj3, "dummy_columns": x3.columns.tolist(),
        "categorical_vocab": _categorical_vocab(x3_raw, obj3),
    })

    df = _add_late_features(base)
    leak = ["sleep_quality_score", "sleep_disorder_risk", "felt_rested", "cognitive_performance_score"]
    chart = ["shift_work_status", "stress_level", "sleep_duration_level"]
    raw = df.drop(columns=leak + chart)
    x_enc, obj_enc = _encode(raw)

    numeric_medians = {c: float(df[c].median()) for c in df.select_dtypes(include="number").columns}
    categorical_modes = {c: str(df[c].mode().iloc[0]) for c in df.select_dtypes(include="object").columns}
    (MODELS_DIR / "sleep_medians.json").write_text(
        json.dumps({"numeric_medians": numeric_medians, "categorical_modes": categorical_modes},
                   indent=2, ensure_ascii=False))

    shared_meta = {
        "encoding": "get_dummies",
        "raw_feature_columns": raw.columns.tolist(),
        "categorical_columns": obj_enc,
        "dummy_columns": x_enc.columns.tolist(),
        "categorical_vocab": _categorical_vocab(raw, obj_enc),
    }

    # #4 sleep_disorder_risk — HGB, RandomForest fallback.
    y4 = df["sleep_disorder_risk"]
    x4_tr, x4_te, y4_tr, y4_te = train_test_split(
        x_enc, y4, test_size=0.2, random_state=RANDOM_STATE, stratify=y4)
    sw4 = compute_sample_weight(class_weight="balanced", y=y4_tr)
    hgb4 = HistGradientBoostingClassifier(max_iter=200, learning_rate=0.05, max_depth=8,
                                          min_samples_leaf=20, random_state=RANDOM_STATE)
    hgb4.fit(x4_tr, y4_tr, sample_weight=sw4)
    disorder_model, disorder_algo, disorder_clf = hgb4, "HistGradientBoosting", hgb4
    try:
        onnx4 = _convert_classifier(hgb4, hgb4, x_enc.shape[1])
        _proba_onnx(onnx4, x4_te.values[:5])
    except Exception as exc:  # noqa: BLE001 - fall back to a convertible model
        report.append(f"  (disorder HGB->ONNX failed: {type(exc).__name__}; using RandomForest)")
        rf4c = RandomForestClassifier(n_estimators=60, max_depth=16, min_samples_leaf=80,
                                      class_weight="balanced",
                                      random_state=RANDOM_STATE, n_jobs=-1)
        rf4c.fit(x4_tr, y4_tr)
        disorder_model, disorder_algo, disorder_clf = rf4c, "RandomForest", rf4c
        onnx4 = _convert_classifier(rf4c, rf4c, x_enc.shape[1])
    report.append(f"sleep_disorder ({disorder_algo}) acc={accuracy_score(y4_te, disorder_model.predict(x4_te)):.3f} (nb 0.950)")
    _write("sleep_disorder_risk", onnx4, {
        "kind": "classifier", **shared_meta,
        "classes": [str(c) for c in disorder_clf.classes_], "algo": disorder_algo,
    })

    # #5 felt_rested — HGB, LogisticRegression fallback.
    y5 = df["felt_rested"]
    x5_tr, x5_te, y5_tr, y5_te = train_test_split(
        x_enc, y5, test_size=0.2, random_state=RANDOM_STATE, stratify=y5)
    sw5 = compute_sample_weight(class_weight="balanced", y=y5_tr)
    hgb5 = HistGradientBoostingClassifier(max_iter=300, learning_rate=0.05, max_depth=6,
                                          min_samples_leaf=20, random_state=RANDOM_STATE)
    hgb5.fit(x5_tr, y5_tr, sample_weight=sw5)
    rested_model, rested_algo, rested_clf, rested_input = hgb5, "HistGradientBoosting", hgb5, x5_te
    try:
        onnx5 = _convert_classifier(hgb5, hgb5, x_enc.shape[1])
        _proba_onnx(onnx5, x5_te.values[:5])
    except Exception as exc:  # noqa: BLE001
        report.append(f"  (felt_rested HGB->ONNX failed: {type(exc).__name__}; using LogisticRegression)")
        lr5 = make_pipeline(StandardScaler(),
                            LogisticRegression(max_iter=1000, class_weight="balanced",
                                               random_state=RANDOM_STATE))
        lr5.fit(x5_tr, y5_tr)
        rested_model, rested_algo, rested_clf = lr5, "LogisticRegression", lr5.steps[-1][1]
        onnx5 = _convert_classifier(lr5, rested_clf, x_enc.shape[1])
    auc5 = roc_auc_score(y5_te, rested_model.predict_proba(rested_input)[:, 1])
    report.append(f"felt_rested ({rested_algo}) auc={auc5:.3f} (nb 0.822)")
    _write("felt_rested", onnx5, {
        "kind": "classifier", **shared_meta,
        "classes": [int(c) for c in rested_clf.classes_], "positive_index": 1, "algo": rested_algo,
    })

    # #6 bedtime_recommender — lighter RandomForest rf4.
    control_cols = ["age", "gender", "bmi", "occupation", "chronotype", "stress_score",
                    "sleep_duration_hrs", "work_hours_that_day", "exercise_day", "steps_that_day",
                    "shift_work", "caffeine_mg_before_bed", "alcohol_units_before_bed",
                    "screen_time_before_bed_hrs", "room_temperature_celsius", "nap_duration_mins",
                    "took_nap", "stimulant_load", "sleep_debt", "work_stress_load",
                    "mental_health_condition"]
    control_cols = [c for c in control_cols if c in df.columns]
    x6_raw = df[control_cols]
    x6, obj6 = _encode(x6_raw)
    y6 = df["sleep_quality_score"]
    x6_tr, x6_te, y6_tr, y6_te = train_test_split(x6, y6, test_size=0.2, random_state=RANDOM_STATE)
    rf6 = RandomForestRegressor(n_estimators=45, max_depth=16, min_samples_leaf=60,
                                random_state=RANDOM_STATE, n_jobs=-1)
    rf6.fit(x6_tr, y6_tr)
    report.append(f"bedtime (RF-lite)       R2={r2_score(y6_te, rf6.predict(x6_te)):.3f} (nb 0.759)")
    onnx6 = _convert_regressor(rf6, x6.shape[1])
    assert np.max(np.abs(_predict_onnx(onnx6, x6_te.values) - rf6.predict(x6_te))) < 1e-2
    _write("bedtime_recommender", onnx6, {
        "kind": "regressor", "encoding": "get_dummies",
        "control_columns": control_cols, "categorical_columns": obj6,
        "dummy_columns": x6.columns.tolist(),
        "categorical_vocab": _categorical_vocab(x6_raw, obj6),
        "defaults": {k: float(v) for k, v in x6.median().to_dict().items()},
        "duration_sweep": {"start": 5.0, "stop": 10.25, "step": 0.25},
    })


def main() -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    report: list[str] = []
    export_brain(report)
    export_sleep(report)
    sizes = {p.name: f"{p.stat().st_size/1024:.0f}KB" for p in sorted(MODELS_DIR.glob("*.onnx"))}
    print("\n=== ONNX export complete ->", MODELS_DIR)
    for line in report:
        print(" ", line)
    print("\n  sizes:", json.dumps(sizes))


if __name__ == "__main__":
    main()
