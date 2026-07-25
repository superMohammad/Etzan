import type { BrainInputs, Platform, SleepInputs } from "./types";
import type { ModelMeta } from "./onnx";
import { bmiFrom, durationHours } from "./compute";

// Training-set maxima used by the notebook's engineered sleep features.
const CAFFEINE_MAX = 400;
const ALCOHOL_MAX = 6;

// Not asked in the UI. All four sleep models were trained with this column, so
// it still has to reach the feature vector — and the training-set median is
// exactly 0, so pinning it here shifts nothing.
const ALCOHOL_UNITS_BEFORE_BED = 0;
const STRESS_MAX = 10;
const WAKE_MAX = 8;
const LATENCY_MAX = 58;

const ALL_PLATFORMS: Platform[] = [
  "Discord", "Facebook", "Instagram", "Pinterest", "Reddit",
  "Snapchat", "TikTok", "Twitter", "YouTube",
];
const REL_VALUES = ["Divorced", "In a relationship", "Married", "Single"] as const;

type NumRecord = Record<string, number>;
type RawRecord = Record<string, number | string>;

// All named brain features (both models pull their own subset via feature_order).
export function brainRecord(inputs: BrainInputs): NumRecord {
  const record: NumRecord = {
    age: inputs.age,
    gender: inputs.gender === "Male" ? 1 : 0,
    Student: inputs.occupation === "Student" ? 1 : 0,
    Retired: inputs.occupation === "Retired" ? 1 : 0,
    daily_time: inputs.daily_time,
    aimless_use: inputs.aimless_use,
    distracted_when_busy: inputs.distracted_when_busy,
    restless_without: inputs.restless_without,
    comparison: inputs.comparison,
    seeks_validation: inputs.seeks_validation,
    depression: inputs.depression,
    worries: inputs.worries,
    concentration_difficulty: inputs.concentration_difficulty,
    interest_fluctuation: inputs.interest_fluctuation,
    sleep_issues: inputs.sleep_issues,
    distractibility: inputs.distractibility,
  };
  for (const p of ALL_PLATFORMS) record[p] = inputs.platforms.includes(p) ? 1 : 0;
  for (const v of REL_VALUES) record[`rel_${v}`] = inputs.relationship === v ? 1 : 0;
  return record;
}

// Order a direct-encoded record into the model's exact feature vector.
export function orderDirect(record: NumRecord, featureOrder: string[]): number[] {
  return featureOrder.map((k) => record[k] ?? 0);
}

// Full raw sleep record (all raw_feature_columns), engineered features recomputed,
// optional wearable fields filled from training medians.
export function sleepRaw(inputs: SleepInputs, medians: Record<string, number>): RawRecord {
  const opt = (name: string, value: number | null): number =>
    value === null ? medians[name] : value;

  const rem = opt("rem_percentage", inputs.rem_percentage);
  const deep = opt("deep_sleep_percentage", inputs.deep_sleep_percentage);
  const latency = opt("sleep_latency_mins", inputs.sleep_latency_mins);
  const wake = opt("wake_episodes_per_night", inputs.wake_episodes_per_night);
  const restingHr = opt("heart_rate_resting_bpm", inputs.heart_rate_resting_bpm);
  // The user's real night, derived from the bedtime and wake-up they entered.
  // This used to be pinned to the training median (6.36h) for everyone, on the
  // grounds that duration was "not asked" — but it is asked, just indirectly,
  // and it is the single most important feature of the models that read it
  // (57% of sleep_quality's importance, and the top feature of the disorder
  // model). Pinning it moved a third of users to the wrong quality level and a
  // fifth to the wrong disorder class.
  const sleepDurationHrs = durationHours(inputs.bedtime, inputs.wake_up_time);

  return {
    age: inputs.age,
    gender: inputs.gender,
    occupation: inputs.occupation,
    bmi: bmiFrom(inputs.height_cm, inputs.weight_kg),
    country: inputs.country,
    sleep_duration_hrs: sleepDurationHrs,
    rem_percentage: rem,
    deep_sleep_percentage: deep,
    sleep_latency_mins: latency,
    wake_episodes_per_night: wake,
    caffeine_mg_before_bed: inputs.caffeine_mg_before_bed,
    alcohol_units_before_bed: ALCOHOL_UNITS_BEFORE_BED,
    exercise_day: inputs.exercise_day,
    steps_that_day: inputs.steps_that_day,
    nap_duration_mins: inputs.nap_duration_mins,
    stress_score: inputs.stress_score,
    work_hours_that_day: inputs.work_hours_that_day,
    chronotype: inputs.chronotype,
    mental_health_condition: inputs.mental_health_condition,
    heart_rate_resting_bpm: restingHr,
    sleep_aid_used: inputs.sleep_aid_used,
    shift_work: inputs.shift_work,
    room_temperature_celsius: inputs.room_temperature_celsius,
    weekend_sleep_diff_hrs: inputs.weekend_sleep_diff_hrs,
    season: inputs.season,
    day_type: inputs.day_type,
    // engineered
    screen_time_before_bed_hrs: inputs.screen_time_before_bed_mins / 60,
    work_stress_load: inputs.work_hours_that_day * inputs.stress_score,
    restorative_sleep_percentage: rem + deep,
    took_nap: inputs.nap_duration_mins > 0 ? 1 : 0,
    // The alcohol term is kept, at its pinned value, so this stays visibly the
    // same expression the notebook trained on.
    stimulant_load:
      inputs.caffeine_mg_before_bed / (CAFFEINE_MAX + 1) +
      ALCOHOL_UNITS_BEFORE_BED / (ALCOHOL_MAX + 1),
    sleep_debt: Math.abs(inputs.weekend_sleep_diff_hrs),
    disruption_score:
      inputs.stress_score / (STRESS_MAX + 1) +
      wake / (WAKE_MAX + 1) +
      latency / (LATENCY_MAX + 1),
  };
}

// Reproduce pandas get_dummies(drop_first=True) + reindex to the training columns.
export function encodeDummies(raw: RawRecord, meta: ModelMeta): number[] {
  const dummyColumns = meta.dummy_columns ?? [];
  const categorical = meta.categorical_columns ?? [];
  const vocab = meta.categorical_vocab ?? {};

  const lookup = new Map<string, { col: string; value: string }>();
  for (const col of categorical) {
    for (const value of vocab[col] ?? []) {
      lookup.set(`${col}_${value}`, { col, value });
    }
  }

  return dummyColumns.map((name) => {
    const hit = lookup.get(name);
    if (hit) return String(raw[hit.col]) === hit.value ? 1 : 0;
    return Number(raw[name] ?? 0);
  });
}

// The grid of candidate night lengths the recommender was exported with.
export function sweepDurations(meta: ModelMeta): number[] {
  const sweep = meta.duration_sweep ?? { start: 5, stop: 10.25, step: 0.25 };
  const durations: number[] = [];
  for (let d = sweep.start; d < sweep.stop; d += sweep.step) {
    durations.push(Math.round(d * 100) / 100);
  }
  return durations;
}

// One bedtime-recommender row per requested duration, everything else held
// fixed at the user's profile. Taking the durations as an argument rather than
// reading the sweep internally is what lets the caller price the user's OWN
// night on the same curve as the candidates — the two then differ by duration
// alone, which is the only way the before/after comparison means anything.
export function bedtimeRows(
  raw: RawRecord,
  meta: ModelMeta,
  durations: number[]
): number[][] {
  const dummyColumns = meta.dummy_columns ?? [];
  const defaults = meta.defaults ?? {};

  // Encode the user's control inputs, then fill unspecified encoded features
  // from the training medians (matches the notebook's profile fill).
  const encoded = encodeDummies(raw, meta);
  const profile: NumRecord = { ...defaults };
  dummyColumns.forEach((name, i) => {
    if (!Number.isNaN(encoded[i])) profile[name] = encoded[i];
  });

  const idx = dummyColumns.indexOf("sleep_duration_hrs");
  return durations.map((d) => {
    const row = dummyColumns.map((name) => profile[name] ?? 0);
    if (idx >= 0) row[idx] = d;
    return row;
  });
}
