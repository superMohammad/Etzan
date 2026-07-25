import { useState } from "react";
import { Minus, TrendingDown, TrendingUp } from "lucide-react";
import { runBrainCheck } from "../lib/predict";
import { DAILY_TIME_KEYS, REGION_KEY } from "../lib/recommendations";
import { formatNumber, formatRange } from "../lib/format";
import { useLanguage } from "../lib/i18n";
import type { MessageKey } from "../lib/i18n";
import { usePageMeta } from "../lib/usePageMeta";
import { LEVEL_KEY } from "../lib/scoring";
import type { Level } from "../lib/scoring";
import type { BrainInputs, BrainResult, Contributor, Platform } from "../lib/types";
import BrainIllustration from "../components/BrainIllustration";
import {
  ErrorNote,
  FieldGroup,
  LevelScale,
  MetricCard,
  Num,
  ProgressBar,
  RecommendationList,
} from "../components/ui";

const PLATFORMS: Platform[] = [
  "TikTok", "Instagram", "Snapchat", "YouTube", "Twitter",
  "Facebook", "Reddit", "Discord", "Pinterest",
];

const LIKERT_MIN = 1;
const LIKERT_MAX = 5;

const BRAIN_NOTE: Record<Level, MessageKey> = {
  1: "brain.note.1", 2: "brain.note.2", 3: "brain.note.3", 4: "brain.note.4", 5: "brain.note.5",
};
const MH_NOTE: Record<Level, MessageKey> = {
  1: "brain.mh.note.1", 2: "brain.mh.note.2", 3: "brain.mh.note.3", 4: "brain.mh.note.4", 5: "brain.mh.note.5",
};

const INITIAL: BrainInputs = {
  age: 22, gender: "Female", occupation: "Student", relationship: "Single",
  platforms: ["Instagram"], daily_time: 2,
  aimless_use: 3, distracted_when_busy: 3, restless_without: 3, comparison: 3, seeks_validation: 3,
  depression: 3, worries: 3, concentration_difficulty: 3, interest_fluctuation: 3, sleep_issues: 3, distractibility: 3,
};

function Likert({
  labelKey,
  value,
  onChange,
}: {
  labelKey: MessageKey;
  value: number;
  onChange: (v: number) => void;
}): JSX.Element {
  const { lang, t } = useLanguage();
  return (
    <div className="field">
      <label>
        {t(labelKey)}
        <span className="hint">
          <Num>
            {t("brain.likertHint", {
              range: formatRange(lang, LIKERT_MIN, LIKERT_MAX),
              value: formatNumber(lang, value, 0),
            })}
          </Num>
        </span>
      </label>
      <input
        type="range"
        min={LIKERT_MIN}
        max={LIKERT_MAX}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <div className="range-ends">
        <span>{t("brain.likert.1")}</span>
        <span>{t("brain.likert.5")}</span>
      </div>
    </div>
  );
}

function ContributorRow({ item }: { item: Contributor }): JSX.Element {
  const { lang, t } = useLanguage();
  const answer =
    item.answer.kind === "likert"
      ? t("brain.contributors.answer", {
          value: formatNumber(lang, item.answer.value, 0),
          max: formatNumber(lang, item.answer.max, 0),
        })
      : t(item.answer.labelKey);

  return (
    <li className="contributor-row">
      {item.direction === "raises" && (
        <TrendingUp size={20} color="var(--blush-deep)" aria-label={t("brain.contributors.raises")} />
      )}
      {item.direction === "lowers" && (
        <TrendingDown size={20} color="var(--sage-deep)" aria-label={t("brain.contributors.lowers")} />
      )}
      {item.direction === "neutral" && (
        <Minus size={20} color="var(--cocoa-soft)" aria-label={t("brain.contributors.neutralItem")} />
      )}
      <span style={{ flex: 1 }}>{t(item.labelKey)}</span>
      <strong style={{ color: "var(--cocoa-soft)", fontSize: "0.92rem" }}>{answer}</strong>
    </li>
  );
}

export default function BrainCheck(): JSX.Element {
  const { lang, t } = useLanguage();
  usePageMeta("meta.brain.title", "meta.brain.description");

  const [form, setForm] = useState<BrainInputs>(INITIAL);
  const [step, setStep] = useState(0);
  const [result, setResult] = useState<BrainResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof BrainInputs>(key: K, value: BrainInputs[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }
  function togglePlatform(id: Platform): void {
    setForm((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(id) ? prev.platforms.filter((p) => p !== id) : [...prev.platforms, id],
    }));
  }

  const steps: { titleKey: MessageKey; node: JSX.Element }[] = [
    {
      titleKey: "brain.step.about",
      node: (
        <div className="grid grid-2">
          <div className="field">
            <label>{t("brain.field.age")}</label>
            <input type="number" value={form.age} min={13} max={80} onChange={(e) => set("age", Number(e.target.value))} />
            <span className="hint">
              <Num>{t("brain.field.ageHint", { range: formatRange(lang, 13, 80) })}</Num>
            </span>
          </div>
          <div className="field">
            <label>{t("brain.field.gender")}</label>
            <select value={form.gender} onChange={(e) => set("gender", e.target.value as BrainInputs["gender"])}>
              <option value="Female">{t("brain.gender.female")}</option>
              <option value="Male">{t("brain.gender.male")}</option>
            </select>
          </div>
          <div className="field">
            <label>{t("brain.field.occupation")}</label>
            <select value={form.occupation} onChange={(e) => set("occupation", e.target.value as BrainInputs["occupation"])}>
              <option value="Student">{t("brain.occupation.student")}</option>
              <option value="Worker">{t("brain.occupation.worker")}</option>
              <option value="Retired">{t("brain.occupation.retired")}</option>
            </select>
          </div>
          <div className="field">
            <label>{t("brain.field.relationship")}</label>
            <select value={form.relationship} onChange={(e) => set("relationship", e.target.value as BrainInputs["relationship"])}>
              <option value="Single">{t("brain.relationship.single")}</option>
              <option value="In a relationship">{t("brain.relationship.inRelationship")}</option>
              <option value="Married">{t("brain.relationship.married")}</option>
              <option value="Divorced">{t("brain.relationship.divorced")}</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      titleKey: "brain.step.usage",
      node: (
        <>
          <div className="field">
            <label>{t("brain.field.dailyTime")}</label>
            <select value={form.daily_time} onChange={(e) => set("daily_time", Number(e.target.value))}>
              {DAILY_TIME_KEYS.map((key, i) => <option key={key} value={i}>{t(key)}</option>)}
            </select>
            <span className="hint">{t("brain.field.dailyTimeHint")}</span>
          </div>
          <div className="field">
            <label>{t("brain.field.platforms")}</label>
            <span className="hint" style={{ marginBottom: "0.6rem" }}>{t("brain.field.platformsHint")}</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
              {PLATFORMS.map((p) => (
                <button type="button" key={p} onClick={() => togglePlatform(p)}
                  aria-pressed={form.platforms.includes(p)}
                  className={form.platforms.includes(p) ? "btn" : "btn btn-ghost"} style={{ padding: "0.5em 1.1em" }}>
                  {p}
                </button>
              ))}
            </div>
          </div>
        </>
      ),
    },
    {
      titleKey: "brain.step.habits",
      node: (
        <FieldGroup legend={t("brain.likertLegend")}>
          <div className="grid grid-2">
            <Likert labelKey="brain.item.aimless" value={form.aimless_use} onChange={(v) => set("aimless_use", v)} />
            <Likert labelKey="brain.item.distracted" value={form.distracted_when_busy} onChange={(v) => set("distracted_when_busy", v)} />
            <Likert labelKey="brain.item.restless" value={form.restless_without} onChange={(v) => set("restless_without", v)} />
            <Likert labelKey="brain.item.comparison" value={form.comparison} onChange={(v) => set("comparison", v)} />
            <Likert labelKey="brain.item.validation" value={form.seeks_validation} onChange={(v) => set("seeks_validation", v)} />
          </div>
        </FieldGroup>
      ),
    },
    {
      titleKey: "brain.step.state",
      node: (
        <FieldGroup legend={t("brain.likertLegend")}>
          <div className="grid grid-2">
            <Likert labelKey="brain.item.depression" value={form.depression} onChange={(v) => set("depression", v)} />
            <Likert labelKey="brain.item.worries" value={form.worries} onChange={(v) => set("worries", v)} />
            <Likert labelKey="brain.item.concentration" value={form.concentration_difficulty} onChange={(v) => set("concentration_difficulty", v)} />
            <Likert labelKey="brain.item.interest" value={form.interest_fluctuation} onChange={(v) => set("interest_fluctuation", v)} />
            <Likert labelKey="brain.item.sleepIssues" value={form.sleep_issues} onChange={(v) => set("sleep_issues", v)} />
            <Likert labelKey="brain.item.distractibility" value={form.distractibility} onChange={(v) => set("distractibility", v)} />
          </div>
        </FieldGroup>
      ),
    },
  ];

  async function submit(): Promise<void> {
    setLoading(true);
    setError(null);
    try {
      setResult(await runBrainCheck(form));
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
    const raising = result.contributors.some((c) => c.direction === "raises");
    return (
      <div className="container" style={{ maxWidth: 660, paddingTop: "1.5rem" }}>
        {/* One verdict, one scale, one sentence. The mental-health signal is a
            separate model and gets its own card below rather than a contradicting
            pill inside this one. */}
        <div className="card" style={{ textAlign: "center" }}>
          <h1 style={{ fontSize: "1.8rem" }}>{t("brain.resultTitle")}</h1>
          <BrainIllustration
            level={result.level}
            label={t("brain.a11y.illustration", {
              level: result.level,
              name: t(LEVEL_KEY[result.level]),
            })}
          />
          <div style={{ marginTop: "1.2rem" }}>
            <LevelScale level={result.level} />
          </div>
          <p style={{ margin: "1rem 0 0", color: "var(--cocoa-soft)" }}>{t(BRAIN_NOTE[result.level])}</p>
          <p style={{ margin: "0.8rem 0 0", color: "var(--cocoa-soft)", fontSize: "0.88rem" }}>
            {t("brain.relativeNote")}
          </p>
        </div>

        <div className="card" style={{ marginTop: "1.2rem" }}>
          <h2 className="section-heading">
            {raising ? t("brain.contributors.raising") : t("brain.contributors.neutral")}
          </h2>
          <p style={{ marginTop: 0, color: "var(--cocoa-soft)" }}>
            {t("brain.contributors.lead", { region: t(REGION_KEY[result.topRegion]) })}
          </p>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {result.contributors.map((c) => <ContributorRow key={c.key} item={c} />)}
          </ul>
        </div>

        <div style={{ marginTop: "1.2rem" }}>
          <MetricCard
            title={t("brain.mh.title")}
            level={result.mhLevel}
            note={t(MH_NOTE[result.mhLevel])}
          />
          <p style={{ color: "var(--cocoa-soft)", fontSize: "0.92rem", marginTop: "0.6rem" }}>
            {t("brain.mh.explain")}
          </p>
        </div>

        <h2 className="section-heading">{t("common.recommendations")}</h2>
        <RecommendationList items={result.recommendations} />

        <button className="btn btn-ghost" style={{ marginTop: "1.5rem" }} onClick={restart}>
          {t("common.restart")}
        </button>
      </div>
    );
  }

  const isLast = step === steps.length - 1;
  return (
    <div className="container" style={{ maxWidth: 660, paddingTop: "2rem" }}>
      <h1 style={{ fontSize: "1.8rem" }}>{t("brain.pageTitle")}</h1>
      <p style={{ color: "var(--cocoa-soft)" }}>{t("brain.pageIntro")}</p>
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
      <div className="card" style={{ minHeight: 180 }}>
        <h2 className="section-heading">{t(steps[step].titleKey)}</h2>
        {steps[step].node}
      </div>
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
