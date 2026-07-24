import { useState } from "react";
import {
  CartesianGrid, Line, LineChart, ReferenceDot, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { runSleepCheck } from "../lib/predict";
import { bmiFrom, durationHours } from "../lib/compute";
import { formatNumber, formatPercent, formatRange } from "../lib/format";
import { LEVEL_KEY, levelPositionFromQuality10, toLevel } from "../lib/scoring";
import { useLanguage } from "../lib/i18n";
import type { MessageKey } from "../lib/i18n";
import { usePageMeta } from "../lib/usePageMeta";
import type { SleepInputs, SleepResult } from "../lib/types";
import SleepIllustration from "../components/SleepIllustration";
import {
  ErrorNote,
  FieldGroup,
  LevelScale,
  MetricCard,
  Num,
  ProgressBar,
  RecommendationList,
  TechnicalDetails,
} from "../components/ui";

const OCCUPATIONS = ["Student", "Teacher", "Software Engineer", "Doctor", "Nurse", "Manager", "Sales", "Driver", "Freelancer", "Homemaker", "Retired", "Lawyer"];
const COUNTRIES = ["Saudi Arabia", "USA", "UK", "Germany", "France", "Japan", "India", "Brazil", "Canada", "Australia", "Spain", "Italy", "Mexico", "Netherlands", "Sweden", "South Korea"];

const STRESS_MIN = 1;
const STRESS_MAX = 10;
const QUALITY_MAX = 10;
const NEGLIGIBLE_DELTA = 0.05; // /10 points below which the change is noise

const INITIAL: SleepInputs = {
  age: 28, gender: "Male", occupation: "Student", country: "Saudi Arabia",
  chronotype: "Neutral", mental_health_condition: "Healthy",
  height_cm: 170, weight_kg: 70,
  stress_score: 5, work_hours_that_day: 8, exercise_day: 0, steps_that_day: 6000,
  nap_duration_mins: 0, shift_work: 0, day_type: "Weekday", season: "Summer",
  caffeine_mg_before_bed: 40, alcohol_units_before_bed: 0, screen_time_before_bed_mins: 45,
  room_temperature_celsius: 23, sleep_aid_used: 0,
  bedtime: "00:30", wake_up_time: "07:00", weekend_sleep_diff_hrs: 1,
  rem_percentage: null, deep_sleep_percentage: null, sleep_latency_mins: null,
  wake_episodes_per_night: null, heart_rate_resting_bpm: null,
};

// The gain from following the recommended bedtime, stated in levels rather than
// as a second /10 number competing with the first.
//
// The level bands are coarse, so a real improvement can land inside one band.
// The quality delta is consulted in that case rather than claiming the current
// schedule is already near-optimal — which would contradict a recommendation to
// sleep two hours longer.
function gainKey(currentLevel: number, recommendedLevel: number, qualityDelta: number): MessageKey {
  const gain = currentLevel - recommendedLevel;
  if (gain === 1) return "sleep.gain.one";
  if (gain === 2) return "sleep.gain.two";
  if (gain > 2) return "sleep.gain.many";
  if (gain < 0) return "sleep.gain.worse";
  if (qualityDelta > NEGLIGIBLE_DELTA) return "sleep.gain.within";
  return "sleep.gain.none";
}

export default function SleepCheck(): JSX.Element {
  const { lang, t } = useLanguage();
  usePageMeta("meta.sleep.title", "meta.sleep.description");

  const [form, setForm] = useState<SleepInputs>(INITIAL);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<SleepResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof SleepInputs>(key: K, value: SleepInputs[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  const num = (v: string): number | null => (v === "" ? null : Number(v));
  const range = (min: number, max: number): string => formatRange(lang, min, max);
  const bmi = bmiFrom(form.height_cm, form.weight_kg);
  const duration = durationHours(form.bedtime, form.wake_up_time);

  const steps: { titleKey: MessageKey; node: JSX.Element }[] = [
    {
      titleKey: "sleep.step.about",
      node: (
        <div className="grid grid-2">
          <div className="field"><label>{t("sleep.field.age")}</label>
            <input type="number" min={13} max={90} value={form.age} onChange={(e) => set("age", Number(e.target.value))} />
            <span className="hint"><Num>{range(13, 90)}</Num></span></div>
          <div className="field"><label>{t("sleep.field.gender")}</label>
            <select value={form.gender} onChange={(e) => set("gender", e.target.value as SleepInputs["gender"])}>
              <option value="Female">{t("sleep.gender.female")}</option>
              <option value="Male">{t("sleep.gender.male")}</option>
              <option value="Other">{t("sleep.gender.other")}</option>
            </select></div>
          <div className="field"><label>{t("sleep.field.height")}</label>
            <input type="number" min={120} max={220} value={form.height_cm} onChange={(e) => set("height_cm", Number(e.target.value))} />
            <span className="hint"><Num>{range(120, 220)}</Num></span></div>
          <div className="field"><label>{t("sleep.field.weight")}</label>
            <input type="number" min={30} max={250} value={form.weight_kg} onChange={(e) => set("weight_kg", Number(e.target.value))} />
            <span className="hint"><Num>{range(30, 250)}</Num></span></div>
          <div className="field" style={{ alignSelf: "center" }}>
            <label>{t("sleep.field.bmi")}</label>
            <div style={{ fontWeight: 700, fontSize: "1.2rem" }} className="c-sage"><Num>{formatNumber(lang, bmi, 1)}</Num></div>
            <span className="hint">{t("sleep.field.bmiHint")}</span>
          </div>
          <div className="field"><label>{t("sleep.field.chronotype")}</label>
            <select value={form.chronotype} onChange={(e) => set("chronotype", e.target.value as SleepInputs["chronotype"])}>
              <option value="Morning">{t("sleep.chronotype.morning")}</option>
              <option value="Evening">{t("sleep.chronotype.evening")}</option>
              <option value="Neutral">{t("sleep.chronotype.neutral")}</option>
            </select></div>
          <div className="field"><label>{t("sleep.field.occupation")}</label>
            <select value={form.occupation} onChange={(e) => set("occupation", e.target.value)}>
              {OCCUPATIONS.map((o) => <option key={o} value={o}>{o}</option>)}
            </select></div>
          <div className="field"><label>{t("sleep.field.country")}</label>
            <select value={form.country} onChange={(e) => set("country", e.target.value)}>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select></div>
          <div className="field"><label>{t("sleep.field.mentalHealth")}</label>
            <select value={form.mental_health_condition} onChange={(e) => set("mental_health_condition", e.target.value as SleepInputs["mental_health_condition"])}>
              <option value="Healthy">{t("sleep.mh.healthy")}</option>
              <option value="Anxiety">{t("sleep.mh.anxiety")}</option>
              <option value="Depression">{t("sleep.mh.depression")}</option>
              <option value="Both">{t("sleep.mh.both")}</option>
            </select></div>
        </div>
      ),
    },
    {
      titleKey: "sleep.step.day",
      node: (
        <div className="grid grid-2">
          <div className="field"><label>{t("sleep.field.stress")}
            <span className="hint"><Num>{t("dash.rangeHint", { range: range(STRESS_MIN, STRESS_MAX), value: formatNumber(lang, form.stress_score, 0) })}</Num></span></label>
            <input type="range" min={STRESS_MIN} max={STRESS_MAX} value={form.stress_score} onChange={(e) => set("stress_score", Number(e.target.value))} /></div>
          <div className="field"><label>{t("sleep.field.workHours")}</label>
            <input type="number" min={0} max={18} step="0.5" value={form.work_hours_that_day} onChange={(e) => set("work_hours_that_day", Number(e.target.value))} />
            <span className="hint"><Num>{range(0, 18)}</Num></span></div>
          <div className="field"><label>{t("sleep.field.steps")}</label>
            <input type="number" min={0} max={40000} step={100} value={form.steps_that_day} onChange={(e) => set("steps_that_day", Number(e.target.value))} />
            <span className="hint"><Num>{range(0, 40000)}</Num></span></div>
          <div className="field"><label>{t("sleep.field.nap")}</label>
            <input type="number" min={0} max={240} step={5} value={form.nap_duration_mins} onChange={(e) => set("nap_duration_mins", Number(e.target.value))} />
            <span className="hint"><Num>{range(0, 240)}</Num></span></div>
          <div className="field"><label>{t("sleep.field.exercise")}</label>
            <select value={form.exercise_day} onChange={(e) => set("exercise_day", Number(e.target.value))}>
              <option value={0}>{t("common.no")}</option><option value={1}>{t("common.yes")}</option></select></div>
          <div className="field"><label>{t("sleep.field.shiftWork")}</label>
            <select value={form.shift_work} onChange={(e) => set("shift_work", Number(e.target.value))}>
              <option value={0}>{t("common.no")}</option><option value={1}>{t("common.yes")}</option></select></div>
          <div className="field"><label>{t("sleep.field.dayType")}</label>
            <select value={form.day_type} onChange={(e) => set("day_type", e.target.value as SleepInputs["day_type"])}>
              <option value="Weekday">{t("sleep.dayType.weekday")}</option>
              <option value="Weekend">{t("sleep.dayType.weekend")}</option></select></div>
          <div className="field"><label>{t("sleep.field.season")}</label>
            <select value={form.season} onChange={(e) => set("season", e.target.value as SleepInputs["season"])}>
              <option value="Spring">{t("sleep.season.spring")}</option>
              <option value="Summer">{t("sleep.season.summer")}</option>
              <option value="Autumn">{t("sleep.season.autumn")}</option>
              <option value="Winter">{t("sleep.season.winter")}</option></select></div>
        </div>
      ),
    },
    {
      titleKey: "sleep.step.beforeBed",
      node: (
        <>
          <div className="grid grid-2">
            <div className="field"><label>{t("sleep.field.caffeine")}</label>
              <input type="number" min={0} max={600} step={10} value={form.caffeine_mg_before_bed} onChange={(e) => set("caffeine_mg_before_bed", Number(e.target.value))} />
              <span className="hint"><Num>{t("sleep.field.caffeineHint", { range: range(0, 600) })}</Num></span></div>
            <div className="field"><label>{t("sleep.field.alcohol")}</label>
              <input type="number" min={0} max={10} value={form.alcohol_units_before_bed} onChange={(e) => set("alcohol_units_before_bed", Number(e.target.value))} />
              <span className="hint"><Num>{range(0, 10)}</Num></span></div>
            <div className="field"><label>{t("sleep.field.screenBeforeBed")}</label>
              <input type="number" min={0} max={300} step={5} value={form.screen_time_before_bed_mins} onChange={(e) => set("screen_time_before_bed_mins", Number(e.target.value))} />
              <span className="hint"><Num>{range(0, 300)}</Num></span></div>
            <div className="field"><label>{t("sleep.field.roomTemp")}</label>
              <input type="number" min={10} max={35} value={form.room_temperature_celsius} onChange={(e) => set("room_temperature_celsius", Number(e.target.value))} />
              <span className="hint"><Num>{t("sleep.field.roomTempHint", { range: range(18, 21) })}</Num></span></div>
            <div className="field"><label>{t("sleep.field.bedtime")}</label>
              <input type="time" dir="ltr" value={form.bedtime} onChange={(e) => set("bedtime", e.target.value)} /></div>
            <div className="field"><label>{t("sleep.field.wakeUp")}</label>
              <input type="time" dir="ltr" value={form.wake_up_time} onChange={(e) => set("wake_up_time", e.target.value)} /></div>
            <div className="field"><label>{t("sleep.field.weekendDiff")}</label>
              <input type="number" min={0} max={6} step="0.5" value={form.weekend_sleep_diff_hrs} onChange={(e) => set("weekend_sleep_diff_hrs", Number(e.target.value))} />
              <span className="hint">{t("sleep.field.weekendDiffHint")}</span></div>
            <div className="field"><label>{t("sleep.field.sleepAid")}</label>
              <select value={form.sleep_aid_used} onChange={(e) => set("sleep_aid_used", Number(e.target.value))}>
                <option value={0}>{t("common.no")}</option><option value={1}>{t("common.yes")}</option></select></div>
          </div>
          <p style={{ color: "var(--cocoa-soft)" }}>
            <Num>{t("sleep.field.duration", { hours: formatNumber(lang, duration, 1) })}</Num>
          </p>
        </>
      ),
    },
    {
      titleKey: "sleep.step.wearable",
      node: (
        <FieldGroup legend={t("sleep.wearable.legend")}>
          <p style={{ color: "var(--cocoa-soft)", marginTop: 0 }}>{t("sleep.wearable.intro")}</p>
          <div className="grid grid-2">
            <div className="field"><label>{t("sleep.field.rem")}</label>
              <input type="number" min={0} max={100} value={form.rem_percentage ?? ""} onChange={(e) => set("rem_percentage", num(e.target.value))} />
              <span className="hint"><Num>{t("sleep.field.remHint", { range: range(0, 100) })}</Num></span></div>
            <div className="field"><label>{t("sleep.field.deep")}</label>
              <input type="number" min={0} max={100} value={form.deep_sleep_percentage ?? ""} onChange={(e) => set("deep_sleep_percentage", num(e.target.value))} />
              <span className="hint"><Num>{range(0, 100)}</Num></span></div>
            <div className="field"><label>{t("sleep.field.latency")}</label>
              <input type="number" min={0} max={180} value={form.sleep_latency_mins ?? ""} onChange={(e) => set("sleep_latency_mins", num(e.target.value))} />
              <span className="hint"><Num>{range(0, 180)}</Num></span></div>
            <div className="field"><label>{t("sleep.field.wakeEpisodes")}</label>
              <input type="number" min={0} max={20} value={form.wake_episodes_per_night ?? ""} onChange={(e) => set("wake_episodes_per_night", num(e.target.value))} />
              <span className="hint"><Num>{range(0, 20)}</Num></span></div>
            <div className="field"><label>{t("sleep.field.heartRate")}</label>
              <input type="number" min={35} max={130} value={form.heart_rate_resting_bpm ?? ""} onChange={(e) => set("heart_rate_resting_bpm", num(e.target.value))} />
              <span className="hint"><Num>{t("sleep.field.heartRateHint", { range: range(35, 130) })}</Num></span></div>
          </div>
        </FieldGroup>
      ),
    },
  ];

  async function submit(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      setResult(await runSleepCheck(form));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }
  function restart(): void {
    setResult(null);
    setStep(0);
    setForm(INITIAL);
  }

  if (result) {
    // The curve is plotted on the same 1-5 level scale as every card, with the
    // axis reversed so "better" is up. Showing it as raw /10 quality was what
    // put two unexplained quality numbers on one screen.
    const curve = result.sweep.map((point) => ({
      hours: point.hours,
      level: Math.round(levelPositionFromQuality10(point.quality) * 100) / 100,
    }));
    const peak = curve.reduce((a, b) => (b.level < a.level ? b : a), curve[0]);

    return (
      <div className="container" style={{ maxWidth: 740, paddingTop: "1.5rem" }}>
        <div className="card" style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "1.8rem" }}>{t("sleep.resultTitle")}</h1>
          <SleepIllustration
            level={result.recommendedLevel}
            bedtime={result.bedtime}
            wakeUp={result.wakeUp}
            hours={formatNumber(lang, result.recommendedHours, 1)}
            label={t("sleep.a11y.illustration", {
              bedtime: result.bedtime,
              wakeUp: result.wakeUp,
              hours: formatNumber(lang, result.recommendedHours, 1),
              level: result.recommendedLevel,
              name: t(LEVEL_KEY[result.recommendedLevel]),
            })}
          />
          <p style={{ margin: "0.6rem 0 0", color: "var(--cocoa-soft)" }}>
            <Num>
              {t("sleep.result.schedule", {
                hours: formatNumber(lang, result.recommendedHours, 1),
                bedtime: result.bedtime,
                wakeUp: result.wakeUp,
              })}
            </Num>
          </p>
        </div>

        {/* Before/after. These two levels come from the same model on two
            different schedules — presented as one comparison, never as two
            standalone quality figures. */}
        <div className="card" style={{ marginTop: "1.2rem" }}>
          <h2 style={{ fontSize: "1.3rem" }}>{t("sleep.result.compareTitle")}</h2>
          <p style={{ marginTop: 0, color: "var(--cocoa-soft)" }}>{t("sleep.result.compareIntro")}</p>
          <div className="grid grid-2">
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontSize: "1.05rem" }}>{t("sleep.result.current")}</h3>
              <LevelScale level={result.currentLevel} />
              <p style={{ color: "var(--cocoa-soft)", marginBottom: 0 }}>
                <Num>
                  {t("sleep.result.currentDetail", {
                    hours: formatNumber(lang, result.currentHours, 1),
                    bedtime: form.bedtime,
                  })}
                </Num>
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <h3 style={{ fontSize: "1.05rem" }}>{t("sleep.result.recommended")}</h3>
              <LevelScale level={result.recommendedLevel} />
              <p style={{ color: "var(--cocoa-soft)", marginBottom: 0 }}>
                {t(gainKey(result.currentLevel, result.recommendedLevel, result.qualityDelta), {
                  count: formatNumber(lang, result.currentLevel - result.recommendedLevel, 0),
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-2" style={{ marginTop: "1.2rem" }}>
          <MetricCard
            title={t("sleep.disorder.title")}
            level={result.disorderLevel}
            note={t(result.disorderLabelKey)}
          />
          <div className="card" style={{ textAlign: "center" }}>
            <h3>{t("sleep.rested.title")}</h3>
            <div style={{ fontSize: "2rem", fontWeight: 700, fontFamily: "var(--serif)" }}>
              <Num>{formatPercent(lang, result.feltRestedProbability)}</Num>
            </div>
            <p style={{ color: "var(--cocoa-soft)", marginBottom: 0 }}>{t("sleep.rested.note")}</p>
          </div>
        </div>

        <div className="card" style={{ marginTop: "1.2rem" }}>
          <h2 style={{ fontSize: "1.3rem" }}>{t("sleep.curve.title")}</h2>
          <p style={{ marginTop: 0, color: "var(--cocoa-soft)" }}>{t("sleep.curve.intro")}</p>
          <div style={{ direction: "ltr", width: "100%", height: 260 }}>
            <ResponsiveContainer>
              <LineChart data={curve} margin={{ top: 10, right: 20, bottom: 24, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis
                  dataKey="hours"
                  tick={{ fontSize: 12 }}
                  label={{ value: t("sleep.curve.xAxis"), position: "insideBottom", offset: -14, fontSize: 12 }}
                />
                <YAxis
                  domain={[1, 5]}
                  ticks={[1, 2, 3, 4, 5]}
                  reversed
                  width={104}
                  tick={{ fontSize: 11 }}
                  tickFormatter={(v: number) => t(LEVEL_KEY[toLevel(v)])}
                />
                <Tooltip
                  formatter={(v: number) => [t(LEVEL_KEY[toLevel(v)]), t("sleep.curve.tooltipLevel")]}
                  labelFormatter={(h: number) => t("sleep.curve.tooltipHours", { hours: formatNumber(lang, Number(h), 1) })}
                />
                <Line type="monotone" dataKey="level" stroke="#e88a5f" strokeWidth={3} dot={false} />
                <ReferenceDot x={peak.hours} y={peak.level} r={7} fill="#7fa87c" stroke="#fff" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <h2 style={{ marginTop: "1.5rem", fontSize: "1.3rem" }}>{t("common.recommendations")}</h2>
        <RecommendationList items={result.recommendations} />

        <div className="card" style={{ marginTop: "1.2rem" }}>
          <TechnicalDetails>
            <p><Num>{t("sleep.tech.current", { value: formatNumber(lang, result.sleepQuality, 2), max: formatNumber(lang, QUALITY_MAX, 0) })}</Num></p>
            <p><Num>{t("sleep.tech.recommended", { value: formatNumber(lang, result.predictedQualityAtBedtime, 2), max: formatNumber(lang, QUALITY_MAX, 0) })}</Num></p>
            <p><Num>{t("sleep.tech.delta", { value: formatNumber(lang, result.qualityDelta, 2) })}</Num></p>
          </TechnicalDetails>
        </div>

        <button className="btn btn-ghost" style={{ marginTop: "1.5rem" }} onClick={restart}>
          {t("common.restart")}
        </button>
      </div>
    );
  }

  const isLast = step === steps.length - 1;
  return (
    <div className="container" style={{ maxWidth: 740, paddingTop: "2rem" }}>
      <h1 style={{ fontSize: "1.8rem" }}>{t("sleep.pageTitle")}</h1>
      <p style={{ color: "var(--cocoa-soft)" }}>{t("sleep.pageIntro")}</p>
      <div style={{ margin: "1rem 0 1.5rem" }}>
        <ProgressBar step={step + 1} total={steps.length} />
        <div style={{ textAlign: "center", color: "var(--cocoa-soft)", marginTop: "0.5rem" }}>
          <Num>
            {t("common.step", {
              current: formatNumber(lang, step + 1, 0),
              total: formatNumber(lang, steps.length, 0),
            })}
          </Num>
        </div>
      </div>
      <div className="card"><h2 style={{ fontSize: "1.3rem" }}>{t(steps[step].titleKey)}</h2>{steps[step].node}</div>
      {error && <div style={{ marginTop: "1rem" }}><ErrorNote message={error} /></div>}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1.5rem" }}>
        <button className="btn btn-ghost" disabled={step === 0} onClick={() => setStep((s) => s - 1)}>
          {t("common.previous")}
        </button>
        {isLast
          ? <button className="btn" disabled={loading} onClick={submit}>
              {loading ? t("common.analyzing") : t("common.showResult")}
            </button>
          : <button className="btn" onClick={() => setStep((s) => s + 1)}>{t("common.next")}</button>}
      </div>
    </div>
  );
}
