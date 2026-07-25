import type { Level } from "./scoring";
import type { MessageKey } from "./i18n";

export type ScoreColor = "sage" | "butter" | "blush";

// Lobes of the brain illustration. Each contributing factor is attributed to
// one, so the illustration can light the area behind the top factor.
export type BrainRegion = "frontal" | "parietal" | "temporal" | "occipital";

export type Platform =
  | "Discord" | "Facebook" | "Instagram" | "Pinterest" | "Reddit"
  | "Snapchat" | "TikTok" | "Twitter" | "YouTube";

export type Occupation = "Student" | "Worker" | "Retired";
export type Relationship = "Single" | "Married" | "In a relationship" | "Divorced";

// lib/ holds no presentation copy: results carry message keys and the page
// resolves them in the active language.
export interface Recommendation {
  key: string;
  titleKey: MessageKey;
  bodyKey: MessageKey;
}

// One factor behind a brain result, with the user's own answer attached so the
// result can be acted on rather than just read.
export interface Contributor {
  key: string;
  labelKey: MessageKey;
  // A discriminated union rather than a pre-rendered string: a Likert answer
  // needs locale-aware number formatting, a bucket answer is already a key.
  answer:
    | { kind: "likert"; value: number; max: number }
    | { kind: "bucket"; labelKey: MessageKey };
  // Relative to the midpoint of the item's own scale. A mid answer is neutral,
  // not a factor that raised the score.
  direction: "raises" | "lowers" | "neutral";
  region: BrainRegion;
  weight: number; // 0-1 share of the questionnaire's maximum for this item
}

// --- Brain check (firstlook questionnaire) --------------------------------- //

export interface BrainInputs {
  age: number;
  gender: "Female" | "Male";
  occupation: Occupation;
  relationship: Relationship;
  platforms: Platform[];
  // overuse items (1-5 Likert), plus daily_time bucket (0-5)
  daily_time: number;
  aimless_use: number;
  distracted_when_busy: number;
  restless_without: number;
  comparison: number;
  seeks_validation: number;
  // distress items (1-5 Likert)
  depression: number;
  worries: number;
  concentration_difficulty: number;
  interest_fluctuation: number;
  sleep_issues: number;
  distractibility: number;
}

export interface BrainResult {
  brainRotProbability: number;
  brainRot: boolean;
  level: Level;
  scoreColor: ScoreColor;
  mentalHealthProbability: number;
  mentalHealthImpact: boolean;
  mhLevel: Level;
  mhColor: ScoreColor;
  contributors: Contributor[];
  topRegion: BrainRegion;
  recommendations: Recommendation[];
}

// --- Sleep check ----------------------------------------------------------- //

export interface SleepInputs {
  age: number;
  gender: "Female" | "Male" | "Other";
  occupation: string;
  country: string;
  chronotype: "Evening" | "Morning" | "Neutral";
  mental_health_condition: "Anxiety" | "Both" | "Depression" | "Healthy";
  height_cm: number;
  weight_kg: number;
  stress_score: number;
  work_hours_that_day: number;
  exercise_day: number;
  steps_that_day: number;
  nap_duration_mins: number;
  shift_work: number;
  day_type: "Weekday" | "Weekend";
  season: "Autumn" | "Spring" | "Summer" | "Winter";
  caffeine_mg_before_bed: number;
  screen_time_before_bed_mins: number;
  room_temperature_celsius: number;
  sleep_aid_used: number;
  bedtime: string; // HH:MM
  wake_up_time: string; // HH:MM
  weekend_sleep_diff_hrs: number;
  // optional wearable fields (median fallback)
  rem_percentage: number | null;
  deep_sleep_percentage: number | null;
  sleep_latency_mins: number | null;
  wake_episodes_per_night: number | null;
  heart_rate_resting_bpm: number | null;
}

export interface SweepPoint {
  hours: number;
  quality: number;
}

export interface SleepResult {
  // Quality tonight on the user's current schedule.
  sleepQuality: number;
  currentLevel: Level;
  currentColor: ScoreColor;
  // Quality if they followed the recommended bedtime instead — the two numbers
  // are only meaningful as a before/after pair, never side by side unlabelled.
  predictedQualityAtBedtime: number;
  recommendedLevel: Level;
  recommendedColor: ScoreColor;
  qualityDelta: number;
  disorderLabelKey: MessageKey; // model class names never reach the UI
  disorderLevel: Level;
  disorderColor: ScoreColor;
  feltRested: boolean;
  feltRestedProbability: number;
  bedtime: string;
  wakeUp: string;
  recommendedHours: number;
  currentHours: number;
  sweep: SweepPoint[];
  recommendations: Recommendation[];
}

// --- Dashboard tracking ---------------------------------------------------- //

export interface DailyLog {
  date: string;
  sleep_hours: number;
  screen_time_hrs: number;
  social_media_hours: number;
  stress: number;
  caffeine_mg: number;
  exercise: number;
  felt_rested: number;
  compulsive_use: number; // 1-5 quick brain-rot self-rating
}

export interface ScoredDay extends DailyLog {
  brainScore: number; // 0-100 (higher = better)
  sleepScore: number; // 0-100
  balance: number; // 0-100 combined اتزان
}

export interface TrendForecast {
  slopePerDay: number;
  verdict: "improving" | "steady" | "declining";
  verdictColor: ScoreColor;
  projected: { date: string; value: number }[];
}
