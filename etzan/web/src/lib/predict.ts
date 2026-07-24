import { getMeta, predictProba, predictValue, predictValues } from "./onnx";
import {
  bedtimeCandidates,
  brainRecord,
  encodeDummies,
  orderDirect,
  sleepRaw,
} from "./features";
import {
  brainContributors,
  brainRecommendations,
  sleepRecommendations,
  topBrainRegion,
} from "./recommendations";
import {
  colorForScore,
  disorderLabelKey,
  disorderLevel,
  levelFromProbability,
  levelFromQuality10,
} from "./scoring";
import { durationHours } from "./compute";
import type { BrainInputs, BrainResult, SleepInputs, SleepResult, SweepPoint } from "./types";

const BASE = import.meta.env.BASE_URL;

let mediansCache: Record<string, number> | null = null;
async function sleepMedians(): Promise<Record<string, number>> {
  if (mediansCache) return mediansCache;
  const res = await fetch(`${BASE}models/sleep_medians.json`);
  const data = (await res.json()) as { numeric_medians: Record<string, number> };
  mediansCache = data.numeric_medians;
  return mediansCache;
}

export async function runBrainCheck(inputs: BrainInputs): Promise<BrainResult> {
  const record = brainRecord(inputs);
  const [brainMeta, mhMeta] = await Promise.all([getMeta("brain_rot"), getMeta("mental_health")]);

  const brainVec = orderDirect(record, brainMeta.feature_order ?? []);
  const mhVec = orderDirect(record, mhMeta.feature_order ?? []);
  const [brainProbaRow, mhProbaRow] = await Promise.all([
    predictProba("brain_rot", brainVec),
    predictProba("mental_health", mhVec),
  ]);

  const brainProb = brainProbaRow[1] ?? brainProbaRow[0];
  const mhProb = mhProbaRow[1] ?? mhProbaRow[0];
  const level = levelFromProbability(brainProb);
  const mhLevel = levelFromProbability(mhProb);
  const contributors = brainContributors(inputs);
  const topRegion = topBrainRegion(contributors);
  const verdict = { brainRot: brainProb >= 0.5, mentalHealthImpact: mhProb >= 0.5 };

  return {
    brainRotProbability: brainProb,
    brainRot: verdict.brainRot,
    level,
    scoreColor: colorForScore(level),
    mentalHealthProbability: mhProb,
    mentalHealthImpact: verdict.mentalHealthImpact,
    mhLevel,
    mhColor: colorForScore(mhLevel),
    contributors,
    topRegion,
    recommendations: brainRecommendations(inputs, verdict),
  };
}

export async function runSleepCheck(inputs: SleepInputs): Promise<SleepResult> {
  const medians = await sleepMedians();
  const raw = sleepRaw(inputs, medians);

  const [qMeta, dMeta, rMeta, bMeta] = await Promise.all([
    getMeta("sleep_quality"),
    getMeta("sleep_disorder_risk"),
    getMeta("felt_rested"),
    getMeta("bedtime_recommender"),
  ]);

  const quality = await predictValue("sleep_quality", encodeDummies(raw, qMeta));
  const disorderRow = await predictProba("sleep_disorder_risk", encodeDummies(raw, dMeta));
  const restedRow = await predictProba("felt_rested", encodeDummies(raw, rMeta));

  const classes = (dMeta.classes ?? []).map(String);
  const disorderClass = classes[disorderRow.indexOf(Math.max(...disorderRow))] ?? "Healthy";
  const restedProb = restedRow[1] ?? restedRow[0];

  // Bedtime sweep: batch-predict quality across candidate durations.
  const { durations, rows } = bedtimeCandidates(raw, bMeta);
  const sweepQuality = await predictValues("bedtime_recommender", rows);
  let bestIdx = 0;
  for (let i = 1; i < sweepQuality.length; i++) {
    if (sweepQuality[i] > sweepQuality[bestIdx]) bestIdx = i;
  }
  const bestHours = durations[bestIdx];
  const sweep: SweepPoint[] = durations.map((h, i) => ({
    hours: h,
    quality: Math.round(sweepQuality[i] * 100) / 100,
  }));

  const [wh, wm] = inputs.wake_up_time.split(":").map(Number);
  let bed = wh * 60 + wm - Math.round(bestHours * 60);
  if (bed < 0) bed += 1440;
  const bedtime = `${String(Math.floor(bed / 60) % 24).padStart(2, "0")}:${String(bed % 60).padStart(2, "0")}`;

  const currentQuality = Math.round(quality * 100) / 100;
  const recommendedQuality = Math.round(sweepQuality[bestIdx] * 100) / 100;
  const currentLevel = levelFromQuality10(currentQuality);
  const recommendedLevel = levelFromQuality10(recommendedQuality);
  const dLevel = disorderLevel(disorderClass);

  return {
    sleepQuality: currentQuality,
    currentLevel,
    currentColor: colorForScore(currentLevel),
    predictedQualityAtBedtime: recommendedQuality,
    recommendedLevel,
    recommendedColor: colorForScore(recommendedLevel),
    qualityDelta: Math.round((recommendedQuality - currentQuality) * 100) / 100,
    disorderLabelKey: disorderLabelKey(disorderClass),
    disorderLevel: dLevel,
    disorderColor: colorForScore(dLevel),
    feltRested: restedProb >= 0.5,
    feltRestedProbability: restedProb,
    bedtime,
    wakeUp: inputs.wake_up_time,
    recommendedHours: bestHours,
    currentHours: durationHours(inputs.bedtime, inputs.wake_up_time),
    sweep,
    recommendations: sleepRecommendations(inputs),
  };
}
