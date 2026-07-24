import type {
  BrainInputs,
  BrainRegion,
  BrainResult,
  Contributor,
  Recommendation,
  SleepInputs,
} from "./types";
import type { MessageKey } from "./i18n";
import { durationHours } from "./compute";

// This module decides WHICH factors and recommendations apply. It never decides
// how they are worded — it returns message keys, so the same logic serves both
// languages and no Arabic string is trapped in the lib layer.

const TEMP_MIN = 18;
const TEMP_MAX = 21;
const LIKERT_MAX = 5;
const DAILY_TIME_BUCKETS = 5;
const MIDPOINT = 0.5; // a factor only counts as raising/lowering off the midpoint
const TOP_CONTRIBUTORS = 3;

// Daily social-media buckets in the questionnaire's own 0-5 ordering. Shared so
// the form options and the "why this result" answers cannot drift apart.
export const DAILY_TIME_KEYS: MessageKey[] = [
  "brain.time.0",
  "brain.time.1",
  "brain.time.2",
  "brain.time.3",
  "brain.time.4",
  "brain.time.5",
];

export const REGION_KEY: Record<BrainRegion, MessageKey> = {
  frontal: "region.frontal",
  parietal: "region.parietal",
  temporal: "region.temporal",
  occipital: "region.occipital",
};

interface LikertItem {
  key: string;
  labelKey: MessageKey;
  region: BrainRegion;
  value: number;
}

function likertItems(inputs: BrainInputs): LikertItem[] {
  return [
    { key: "aimless_use", labelKey: "contrib.aimless_use", region: "frontal", value: inputs.aimless_use },
    { key: "distracted_when_busy", labelKey: "contrib.distracted_when_busy", region: "frontal", value: inputs.distracted_when_busy },
    { key: "distractibility", labelKey: "contrib.distractibility", region: "frontal", value: inputs.distractibility },
    { key: "concentration_difficulty", labelKey: "contrib.concentration_difficulty", region: "frontal", value: inputs.concentration_difficulty },
    { key: "restless_without", labelKey: "contrib.restless_without", region: "parietal", value: inputs.restless_without },
    { key: "worries", labelKey: "contrib.worries", region: "parietal", value: inputs.worries },
    { key: "depression", labelKey: "contrib.depression", region: "parietal", value: inputs.depression },
    { key: "interest_fluctuation", labelKey: "contrib.interest_fluctuation", region: "parietal", value: inputs.interest_fluctuation },
    { key: "comparison", labelKey: "contrib.comparison", region: "temporal", value: inputs.comparison },
    { key: "seeks_validation", labelKey: "contrib.seeks_validation", region: "temporal", value: inputs.seeks_validation },
    { key: "sleep_issues", labelKey: "contrib.sleep_issues", region: "occipital", value: inputs.sleep_issues },
  ];
}

function directionFor(weight: number): Contributor["direction"] {
  if (weight > MIDPOINT) return "raises";
  if (weight < MIDPOINT) return "lowers";
  return "neutral";
}

// Rank every questionnaire item by how far it sits along its own scale.
//
// An earlier version only listed items scoring 4 or 5, so the default answers
// produced an empty list and the entire "why this result" section disappeared —
// leaving a score with no explanation. This always returns something: the top
// factors pushing the score up, or, when nothing is elevated, the items closest
// to the bottom of their scale.
export function brainContributors(inputs: BrainInputs): Contributor[] {
  const scored: Contributor[] = likertItems(inputs).map((item) => {
    const weight = (item.value - 1) / (LIKERT_MAX - 1);
    return {
      key: item.key,
      labelKey: item.labelKey,
      answer: { kind: "likert" as const, value: item.value, max: LIKERT_MAX },
      direction: directionFor(weight),
      region: item.region,
      weight,
    };
  });

  const dailyWeight = inputs.daily_time / DAILY_TIME_BUCKETS;
  scored.push({
    key: "daily_time",
    labelKey: "contrib.daily_time",
    answer: { kind: "bucket", labelKey: DAILY_TIME_KEYS[inputs.daily_time] },
    direction: directionFor(dailyWeight),
    region: "occipital",
    weight: dailyWeight,
  });

  const raisers = scored.filter((c) => c.direction === "raises").sort((a, b) => b.weight - a.weight);
  if (raisers.length > 0) return raisers.slice(0, TOP_CONTRIBUTORS);

  // Nothing sits above the midpoint — show the lowest-weight items instead, each
  // keeping its true direction so a mid answer is never presented as protective.
  return [...scored].sort((a, b) => a.weight - b.weight).slice(0, TOP_CONTRIBUTORS);
}

// The area the result card names as the strongest driver.
export function topBrainRegion(contributors: Contributor[]): BrainRegion {
  const top = contributors[0];
  if (top === undefined) throw new Error("brainContributors returned an empty list");
  return top.region;
}

function tip(key: string): Recommendation {
  return { key, titleKey: `rec.${key}.title` as MessageKey, bodyKey: `rec.${key}.body` as MessageKey };
}

// Recommendations take the result, not just the inputs.
//
// Deriving them from inputs alone let a "your habits are fine" fallback render
// directly underneath a mental-health warning, because that branch had no idea
// what the models had actually predicted.
export function brainRecommendations(
  inputs: BrainInputs,
  result: Pick<BrainResult, "brainRot" | "mentalHealthImpact">
): Recommendation[] {
  const tips: Recommendation[] = [];
  if (inputs.daily_time >= 4) tips.push(tip("screenBudget"));
  if (inputs.aimless_use >= 4) tips.push(tip("mindful"));
  if (inputs.restless_without >= 4) tips.push(tip("detach"));
  if (inputs.comparison >= 4 || inputs.seeks_validation >= 4) tips.push(tip("feedHygiene"));
  if (inputs.distracted_when_busy >= 4) tips.push(tip("focusBlocks"));
  if (inputs.sleep_issues >= 4) tips.push(tip("sleepBridge"));
  if (result.mentalHealthImpact) tips.push(tip("mentalHealth"));

  if (tips.length === 0) {
    // Only reachable when neither model flagged anything and no single habit is
    // elevated — the one case where "keep it up" is an honest thing to say.
    tips.push(tip("maintain"));
  } else if (!result.brainRot && !result.mentalHealthImpact) {
    tips.push(tip("watch"));
  }
  return tips;
}

export function sleepRecommendations(inputs: SleepInputs): Recommendation[] {
  const tips: Recommendation[] = [];
  if (inputs.caffeine_mg_before_bed > 50) tips.push(tip("caffeine"));
  if (inputs.screen_time_before_bed_mins > 30) tips.push(tip("screenBeforeBed"));
  if (inputs.room_temperature_celsius < TEMP_MIN || inputs.room_temperature_celsius > TEMP_MAX)
    tips.push(tip("roomTemp"));
  if (inputs.stress_score >= 7) tips.push(tip("stress"));
  if (Math.abs(inputs.weekend_sleep_diff_hrs) >= 1.5) tips.push(tip("regularity"));
  if (durationHours(inputs.bedtime, inputs.wake_up_time) < 7) tips.push(tip("duration"));
  if (tips.length === 0) tips.push(tip("sleepMaintain"));
  return tips;
}
