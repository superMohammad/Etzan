"""Export the six winning models from the notebooks as joblib artifacts.

This reproduces the exact cleaning, feature engineering, split, scaling and fit
from `brainrotEDA (2).ipynb` and `sleep_risk (1).ipynb`, then serializes each
winning estimator together with everything needed to apply it to raw user input
(scalers, feature order, and the get_dummies training column list).

Run: python etzan/export/export_models.py
Artifacts are written to etzan/api/artifacts/.
"""

from __future__ import annotations

import json
from dataclasses import dataclass
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import (
    GradientBoostingClassifier,
    HistGradientBoostingClassifier,
    RandomForestRegressor,
)
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    f1_score,
    mean_absolute_error,
    r2_score,
    roc_auc_score,
)
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.utils.class_weight import compute_sample_weight

PROJECT_ROOT: Path = Path(__file__).resolve().parents[2]
ARTIFACTS_DIR: Path = Path(__file__).resolve().parents[1] / "api" / "artifacts"
RANDOM_STATE: int = 42
COMPRESS_LEVEL: int = 3


def _dump(bundle: dict, filename: str) -> None:
    """Serialize an artifact bundle with compression (keeps hosts light)."""
    joblib.dump(bundle, ARTIFACTS_DIR / filename, compress=COMPRESS_LEVEL)


@dataclass(frozen=True)
class ModelReport:
    """One line of the verification summary printed after export."""

    name: str
    metric_name: str
    value: float
    notebook_value: float


def _categorical_vocab(frame: pd.DataFrame, columns: list[str]) -> dict[str, list[str]]:
    """Sorted unique categories per object column, for building the web forms."""
    return {col: sorted(frame[col].dropna().astype(str).unique().tolist()) for col in columns}


# --------------------------------------------------------------------------- #
# Brain-rot notebook reproduction
# --------------------------------------------------------------------------- #

def _load_brain() -> pd.DataFrame:
    """Cleaning + feature engineering from brainrotEDA cells 3-20."""
    brain = pd.read_csv(PROJECT_ROOT / "Brain Rot Cases Dataset.csv")
    brain = brain.dropna()
    brain = brain.drop_duplicates().reset_index(drop=True)
    brain = brain.drop(
        columns=[
            "How would you rate your level of concern regarding technology use, "
            "particularly social media? On a scale from 1 to 5, where 1 = very low "
            "and 5 = excellent."
        ]
    )
    brain = brain.rename(
        columns={
            brain.columns[0]: "age",
            brain.columns[1]: "gender",
            brain.columns[2]: "edu_level",
            brain.columns[3]: "sm_hours",
            brain.columns[4]: "prefer_tech",
            brain.columns[5]: "screen_hours",
            brain.columns[6]: "excessive",
            brain.columns[7]: "affects_rel",
            brain.columns[8]: "mood_change",
            brain.columns[9]: "focus_level",
            brain.columns[10]: "concentrate_diff",
            brain.columns[11]: "work_distracted",
            brain.columns[12]: "concern_level",
            brain.columns[13]: "affect_mental_health",
            brain.columns[14]: "platform",
            brain.columns[15]: "reduces_fatigue",
            brain.columns[16]: "uses_strategies",
            brain.columns[17]: "strategies_text",
        }
    )

    platform_map = {
        "tiktok": "tiktok", "facebook": "facebook", "instagram": "instagram",
        "telegram": "telegram", "snapchat": "snapchat", "youtube": "youtube",
        "whatsapp": "whatsapp", "x": "x",
    }
    platform_lower = brain["platform"].str.lower().fillna("")
    for name, kw in platform_map.items():
        brain[f"plat_{name}"] = platform_lower.str.contains(kw, na=False).astype(int)

    symptoms = ["excessive", "affects_rel", "mood_change", "concentrate_diff",
                "work_distracted", "affect_mental_health"]
    brain["symptom_score"] = brain[symptoms].sum(axis=1)
    brain["total_screen_load"] = brain["sm_hours"] + brain["screen_hours"]
    brain["sm_dominance"] = brain["sm_hours"] / (brain["total_screen_load"] + 1)
    brain["unfocus_score"] = 6 - brain["focus_level"]
    brain["brain_rot"] = (brain["symptom_score"] >= 5).astype(int)

    return brain.drop(columns=["platform", "strategies_text"])


def _export_brain(reports: list[ModelReport]) -> None:
    brain = _load_brain()

    # Model 1 - brain_rot (LogisticRegression), cells 43-51 -------------------
    leak_cols = ["excessive", "affects_rel", "mood_change", "concentrate_diff",
                 "work_distracted", "affect_mental_health", "symptom_score"]
    x1 = brain.drop(columns=["brain_rot"] + leak_cols)
    y1 = brain["brain_rot"]
    x1_train, x1_test, y1_train, y1_test = train_test_split(
        x1, y1, test_size=0.2, random_state=RANDOM_STATE, stratify=y1
    )
    scaler1 = StandardScaler()
    x1_train_s = scaler1.fit_transform(x1_train)
    x1_test_s = scaler1.transform(x1_test)
    lr = LogisticRegression(max_iter=1000, random_state=RANDOM_STATE)
    lr.fit(x1_train_s, y1_train)
    acc1 = float(accuracy_score(y1_test, lr.predict(x1_test_s)))
    reports.append(ModelReport("brain_rot (LogisticRegression)", "accuracy", acc1, 0.7119))

    _dump(
        {
            "estimator": lr,
            "scaler": scaler1,
            "feature_order": x1.columns.tolist(),
            "target": "brain_rot",
            "classes": lr.classes_.tolist(),
        },
        "brain_rot.joblib",
    )

    # Model 2 - affect_mental_health (GradientBoosting), cells 69-76 -----------
    other_symptoms = ["excessive", "affects_rel", "mood_change",
                      "concentrate_diff", "work_distracted"]
    drop_2 = ["affect_mental_health", "symptom_score", "brain_rot",
              "unfocus_score"] + other_symptoms
    x2 = brain.drop(columns=[c for c in drop_2 if c in brain.columns])
    y2 = brain["affect_mental_health"]
    x2_train, x2_test, y2_train, y2_test = train_test_split(
        x2, y2, test_size=0.2, random_state=RANDOM_STATE, stratify=y2
    )
    scaler2 = StandardScaler()
    x2_train_s = scaler2.fit_transform(x2_train)
    x2_test_s = scaler2.transform(x2_test)
    gb = GradientBoostingClassifier(
        n_estimators=200, learning_rate=0.05, max_depth=4, random_state=RANDOM_STATE
    )
    gb.fit(x2_train_s, y2_train)
    acc2 = float(accuracy_score(y2_test, gb.predict(x2_test_s)))
    reports.append(
        ModelReport("mental_health_impact (GradientBoosting)", "accuracy", acc2, 0.8814)
    )

    _dump(
        {
            "estimator": gb,
            "scaler": scaler2,
            "feature_order": x2.columns.tolist(),
            "target": "affect_mental_health",
            "classes": gb.classes_.tolist(),
        },
        "mental_health_impact.joblib",
    )


# --------------------------------------------------------------------------- #
# Sleep notebook reproduction
# --------------------------------------------------------------------------- #

def _load_sleep_base() -> pd.DataFrame:
    """Cleaning + engineered features that exist BEFORE the quality model
    (sleep_risk cells 4-42). stimulant_load/sleep_debt/disruption_score are
    added later, after Model 3 is trained."""
    df = pd.read_csv(PROJECT_ROOT / "sleep_health_dataset.csv")
    df = df.drop(columns=["person_id"])
    df["screen_time_before_bed_hrs"] = df["screen_time_before_bed_mins"] / 60
    df["work_stress_load"] = df["work_hours_that_day"] * df["stress_score"]
    df["restorative_sleep_percentage"] = df["rem_percentage"] + df["deep_sleep_percentage"]
    df["took_nap"] = (df["nap_duration_mins"] > 0).astype(int)
    df = df.drop(columns=["screen_time_before_bed_mins"])
    df["shift_work_status"] = df["shift_work"].map({0: "No Shift Work", 1: "Shift Work"})
    df["stress_level"] = pd.cut(
        df["stress_score"], bins=[-np.inf, 3, 6, np.inf], labels=["Low", "Moderate", "High"]
    )
    df["sleep_duration_level"] = pd.cut(
        df["sleep_duration_hrs"], bins=[-np.inf, 6, 8, np.inf],
        labels=["Short", "Medium", "Long"]
    )
    return df


def _add_late_features(df: pd.DataFrame) -> pd.DataFrame:
    """sleep_risk cell 86 - added after the quality model is trained."""
    df = df.copy()
    df["stimulant_load"] = (
        df["caffeine_mg_before_bed"] / (df["caffeine_mg_before_bed"].max() + 1)
        + df["alcohol_units_before_bed"] / (df["alcohol_units_before_bed"].max() + 1)
    )
    df["sleep_debt"] = df["weekend_sleep_diff_hrs"].abs()
    df["disruption_score"] = (
        df["stress_score"] / (df["stress_score"].max() + 1)
        + df["wake_episodes_per_night"] / (df["wake_episodes_per_night"].max() + 1)
        + df["sleep_latency_mins"] / (df["sleep_latency_mins"].max() + 1)
    )
    return df


def _fit_dummies_classifier(
    df: pd.DataFrame, target: str, estimator: HistGradientBoostingClassifier
) -> tuple[HistGradientBoostingClassifier, pd.DataFrame, pd.Index, pd.Series, pd.Series, list[str]]:
    """Shared X2/X3 pipeline: drop leak+chart cols, get_dummies, split, fit
    with balanced sample_weight on unscaled data."""
    leak_cols = ["sleep_quality_score", "sleep_disorder_risk", "felt_rested",
                 "cognitive_performance_score"]
    chart_cols = ["shift_work_status", "stress_level", "sleep_duration_level"]
    x_raw = df.drop(columns=leak_cols + chart_cols)
    obj_cols = x_raw.select_dtypes(include="object").columns.tolist()
    x = pd.get_dummies(x_raw, columns=obj_cols, drop_first=True)
    y = df[target]
    x_train, x_test, y_train, y_test = train_test_split(
        x, y, test_size=0.2, random_state=RANDOM_STATE, stratify=y
    )
    weights = compute_sample_weight(class_weight="balanced", y=y_train)
    estimator.fit(x_train, y_train, sample_weight=weights)
    return estimator, x, x.columns, y_test, x_test, obj_cols


def _export_sleep(reports: list[ModelReport]) -> None:
    df = _load_sleep_base()

    # Model 3 - sleep_quality_score (RandomForest Pipeline), cells 70-77 -------
    # Trained BEFORE the late features are added.
    remove_3 = ["sleep_quality_score", "felt_rested", "sleep_disorder_risk",
                "cognitive_performance_score", "shift_work_status",
                "stress_level", "sleep_duration_level"]
    x3 = df.drop(columns=remove_3)
    y3 = df["sleep_quality_score"]
    x3_train, x3_test, y3_train, y3_test = train_test_split(
        x3, y3, test_size=0.2, random_state=RANDOM_STATE
    )
    numerical = x3_train.select_dtypes(include="number").columns
    categorical = x3_train.select_dtypes(exclude="number").columns
    preprocessor = ColumnTransformer(
        [
            ("numerical", SimpleImputer(strategy="median"), numerical),
            (
                "categorical",
                Pipeline(
                    [
                        ("fill_missing", SimpleImputer(strategy="most_frequent")),
                        ("one_hot_encoding", OneHotEncoder(handle_unknown="ignore")),
                    ]
                ),
                categorical,
            ),
        ]
    )
    quality_model = Pipeline(
        [
            ("preprocessor", preprocessor),
            (
                "random_forest",
                RandomForestRegressor(
                    n_estimators=100, max_depth=15, random_state=RANDOM_STATE, n_jobs=-1
                ),
            ),
        ]
    )
    quality_model.fit(x3_train, y3_train)
    r2_q = float(r2_score(y3_test, quality_model.predict(x3_test)))
    mae_q = float(mean_absolute_error(y3_test, quality_model.predict(x3_test)))
    reports.append(ModelReport("sleep_quality (RandomForest)", "R2", r2_q, 0.828))
    reports.append(ModelReport("sleep_quality (RandomForest)", "MAE", mae_q, 0.503))

    _dump(
        {
            "estimator": quality_model,  # full Pipeline handles impute + OHE
            "feature_order": x3.columns.tolist(),
            "categorical_columns": categorical.tolist(),
            "categorical_vocab": _categorical_vocab(x3, categorical.tolist()),
            "target": "sleep_quality_score",
        },
        "sleep_quality.joblib",
    )

    # Late features added for the remaining sleep models ----------------------
    df = _add_late_features(df)

    # Median/mode fallbacks for optional (wearable-style) inputs left blank ----
    numeric_medians = {
        c: float(df[c].median())
        for c in df.select_dtypes(include="number").columns
    }
    categorical_modes = {
        c: str(df[c].mode().iloc[0])
        for c in df.select_dtypes(include="object").columns
    }
    _dump(
        {"numeric_medians": numeric_medians, "categorical_modes": categorical_modes},
        "sleep_medians.joblib",
    )

    # Model 4 - sleep_disorder_risk (HistGradientBoosting), cells 88-95 --------
    disorder_est, x4, x4_cols, y4_test, x4_test, obj4 = _fit_dummies_classifier(
        df,
        "sleep_disorder_risk",
        HistGradientBoostingClassifier(
            max_iter=200, learning_rate=0.05, max_depth=8,
            min_samples_leaf=20, random_state=RANDOM_STATE
        ),
    )
    acc4 = float(accuracy_score(y4_test, disorder_est.predict(x4_test)))
    f1_4 = float(f1_score(y4_test, disorder_est.predict(x4_test), average="weighted"))
    reports.append(ModelReport("sleep_disorder_risk (HistGB)", "accuracy", acc4, 0.9496))

    leak_cols = ["sleep_quality_score", "sleep_disorder_risk", "felt_rested",
                 "cognitive_performance_score"]
    chart_cols = ["shift_work_status", "stress_level", "sleep_duration_level"]
    raw_feature_columns = df.drop(columns=leak_cols + chart_cols).columns.tolist()

    _dump(
        {
            "estimator": disorder_est,
            "dummy_columns": x4_cols.tolist(),
            "raw_feature_columns": raw_feature_columns,
            "categorical_columns": obj4,
            "categorical_vocab": _categorical_vocab(
                df.drop(columns=leak_cols + chart_cols), obj4
            ),
            "target": "sleep_disorder_risk",
            "classes": disorder_est.classes_.tolist(),
            "f1_weighted": f1_4,
        },
        "sleep_disorder_risk.joblib",
    )

    # Model 5 - felt_rested (HistGradientBoosting winner), cells 109-116 -------
    rested_est, _, x5_cols, y5_test, x5_test, obj5 = _fit_dummies_classifier(
        df,
        "felt_rested",
        HistGradientBoostingClassifier(
            max_iter=300, learning_rate=0.05, max_depth=6,
            min_samples_leaf=20, random_state=RANDOM_STATE
        ),
    )
    proba5 = rested_est.predict_proba(x5_test)[:, 1]
    acc5 = float(accuracy_score(y5_test, rested_est.predict(x5_test)))
    auc5 = float(roc_auc_score(y5_test, proba5))
    reports.append(ModelReport("felt_rested (HistGB)", "AUC", auc5, 0.8220))

    _dump(
        {
            "estimator": rested_est,
            "dummy_columns": x5_cols.tolist(),
            "raw_feature_columns": raw_feature_columns,
            "categorical_columns": obj5,
            "categorical_vocab": _categorical_vocab(
                df.drop(columns=leak_cols + chart_cols), obj5
            ),
            "target": "felt_rested",
            "classes": rested_est.classes_.tolist(),
            "accuracy": acc5,
        },
        "felt_rested.joblib",
    )

    # Model 6 - bedtime recommender (rf4), cells 132-150 ----------------------
    control_cols = [
        "age", "gender", "bmi", "occupation", "chronotype", "stress_score",
        "sleep_duration_hrs", "work_hours_that_day", "exercise_day", "steps_that_day",
        "shift_work", "caffeine_mg_before_bed", "alcohol_units_before_bed",
        "screen_time_before_bed_hrs", "room_temperature_celsius", "nap_duration_mins",
        "took_nap", "stimulant_load", "sleep_debt", "work_stress_load",
        "mental_health_condition",
    ]
    control_cols = [c for c in control_cols if c in df.columns]
    x6_raw = df[control_cols]
    obj6 = x6_raw.select_dtypes(include="object").columns.tolist()
    x6 = pd.get_dummies(x6_raw, columns=obj6, drop_first=True)
    y6 = df["sleep_quality_score"]
    x6_train, x6_test, y6_train, y6_test = train_test_split(
        x6, y6, test_size=0.2, random_state=RANDOM_STATE
    )
    rf4 = RandomForestRegressor(
        n_estimators=150, max_depth=15, min_samples_leaf=5,
        random_state=RANDOM_STATE, n_jobs=-1
    )
    rf4.fit(x6_train, y6_train)
    r2_6 = float(r2_score(y6_test, rf4.predict(x6_test)))
    reports.append(ModelReport("bedtime_recommender (RandomForest rf4)", "R2", r2_6, 0.7588))

    _dump(
        {
            "estimator": rf4,
            "dummy_columns": x6.columns.tolist(),
            "control_columns": control_cols,
            "categorical_columns": obj6,
            "categorical_vocab": _categorical_vocab(x6_raw, obj6),
            # medians on the ENCODED matrix, matching notebook X4.median()
            "defaults": x6.median().to_dict(),
            "duration_sweep": {"start": 5.0, "stop": 10.25, "step": 0.25},
            "target": "sleep_quality_score",
        },
        "bedtime_recommender.joblib",
    )


def main() -> None:
    ARTIFACTS_DIR.mkdir(parents=True, exist_ok=True)
    reports: list[ModelReport] = []

    _export_brain(reports)
    _export_sleep(reports)

    metadata = {
        "artifacts": sorted(p.name for p in ARTIFACTS_DIR.glob("*.joblib")),
        "random_state": RANDOM_STATE,
    }
    (ARTIFACTS_DIR / "metadata.json").write_text(json.dumps(metadata, indent=2))

    print("\nExported artifacts to", ARTIFACTS_DIR)
    print(f"{'model':45s} {'metric':10s} {'got':>8s} {'notebook':>10s}")
    print("-" * 76)
    for r in reports:
        print(f"{r.name:45s} {r.metric_name:10s} {r.value:8.4f} {r.notebook_value:10.4f}")


if __name__ == "__main__":
    main()
