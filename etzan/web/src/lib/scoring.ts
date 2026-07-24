import type { MessageKey } from "./i18n";
import type { ScoreColor } from "./types";

// Single source of truth for the risk scale and colors (mirrors the former
// api/app/scoring.py).
//
// The whole product speaks one canonical scale: five named levels where a
// HIGHER level means MORE concern. Probabilities, /10 quality and the 0-100
// dashboard balance all still exist as internal computation, but they are
// converted here before anything is shown, so the user never has to reconcile
// three scales pointing in two directions.

export type Level = 1 | 2 | 3 | 4 | 5;

// Level names live in the message catalogue; this maps a level to its key so
// the scale reads correctly in both languages.
export const LEVEL_KEY: Record<Level, MessageKey> = {
  1: "level.1",
  2: "level.2",
  3: "level.3",
  4: "level.4",
  5: "level.5",
};

// Rendered at both ends of the scale so the direction is never a guess.
export const LEVEL_ENDPOINT_KEY: { low: MessageKey; high: MessageKey } = {
  low: "level.endpointLow",
  high: "level.endpointHigh",
};

export const LEVEL_MAX = 5;

const DISORDER_TO_LEVEL: Record<string, Level> = {
  Healthy: 1,
  Mild: 2,
  Moderate: 4,
  Severe: 5,
};

// Model disorder classes are English enum values; they must never reach the UI
// raw, in either language.
const DISORDER_LABEL_KEY: Record<string, MessageKey> = {
  Healthy: "disorder.Healthy",
  Mild: "disorder.Mild",
  Moderate: "disorder.Moderate",
  Severe: "disorder.Severe",
};

export function colorForScore(level: Level): ScoreColor {
  if (level <= 2) return "sage";
  if (level === 3) return "butter";
  return "blush";
}

// Clamp and round a continuous 1-5 position onto a discrete level.
export function toLevel(continuous: number): Level {
  const rounded = Math.round(continuous);
  if (rounded <= 1) return 1;
  if (rounded >= 5) return 5;
  return rounded as Level;
}

// A 0-1 classifier probability -> level.
//
// The probability is rounded to the precision it is DISPLAYED at before the
// bands are applied. Banding the raw value instead let a probability of 0.398
// land in the 0.2-0.4 band (level 2, sage "balanced") while the same value
// rendered as "40%", which reads as the next band up — the screen then showed a
// green verdict beside a number that contradicted it.
export function levelFromProbability(probability: number): Level {
  const displayed = Math.round(probability * 100) / 100;
  const thresholds = [0.2, 0.4, 0.6, 0.8];
  return toLevel(1 + thresholds.filter((t) => displayed >= t).length);
}

// A 1-10 sleep-quality score -> continuous 1-5 position (10 is best, so the
// scale inverts). Charts plot this directly; the discrete level is derived from
// it below, so a card and the curve beside it can never disagree.
export function levelPositionFromQuality10(quality10: number): number {
  const displayed = Math.round(quality10 * 100) / 100;
  return Math.max(1, Math.min(5, 6.5 - (displayed + 1) / 2));
}

export function levelFromQuality10(quality10: number): Level {
  return toLevel(levelPositionFromQuality10(quality10));
}

// A 0-100 balance sub-score (higher = better) -> continuous 1-5 position
// (higher = worse). Left continuous so charts can plot trends between levels.
export function levelFromBalance100(value: number): number {
  const clamped = Math.max(0, Math.min(100, value));
  return 1 + 4 * (1 - clamped / 100);
}

export function disorderLevel(disorderClass: string): Level {
  const level = DISORDER_TO_LEVEL[disorderClass];
  if (level === undefined) throw new Error(`Unknown disorder class '${disorderClass}'`);
  return level;
}

export function disorderLabelKey(disorderClass: string): MessageKey {
  const key = DISORDER_LABEL_KEY[disorderClass];
  if (key === undefined) throw new Error(`Unknown disorder class '${disorderClass}'`);
  return key;
}

// --- Dashboard 0-100 sub-scores (higher = better) -------------------------- //
//
// These stay continuous: the daily logs are too coarse to fit a trend line on
// five discrete levels. They are computed at full resolution and only mapped to
// a level at render time via levelFromBalance100.

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function sleepBalance0to100(
  sleepHours: number,
  stress: number,
  caffeineMg: number,
  exercise: number,
  feltRested: number
): number {
  const sleep = 1 - clamp01(Math.abs(sleepHours - 8) / 4);
  const stressC = 1 - (stress - 1) / 9;
  const caffeine = 1 - clamp01(caffeineMg / 400);
  const weighted =
    0.4 * sleep + 0.22 * stressC + 0.13 * caffeine + 0.1 * exercise + 0.15 * feltRested;
  return Math.round(weighted * 1000) / 10;
}

export function brainBalance0to100(
  screenHrs: number,
  socialHours: number,
  compulsiveUse: number,
  stress: number
): number {
  const screen = 1 - clamp01(screenHrs / 10);
  const social = 1 - clamp01(socialHours / 6);
  const compulsive = 1 - (compulsiveUse - 1) / 4;
  const stressC = 1 - (stress - 1) / 9;
  const weighted = 0.3 * screen + 0.25 * social + 0.3 * compulsive + 0.15 * stressC;
  return Math.round(weighted * 1000) / 10;
}
