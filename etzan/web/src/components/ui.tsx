import type { ReactNode } from "react";
import { AlertTriangle, Info, Lightbulb } from "lucide-react";
import type { Recommendation, ScoreColor } from "../lib/types";
import type { Level } from "../lib/scoring";
import { LEVEL_ENDPOINT_KEY, LEVEL_KEY, LEVEL_MAX, colorForScore } from "../lib/scoring";
import { formatNumber } from "../lib/format";
import { useLanguage } from "../lib/i18n";

const LEVELS: Level[] = [1, 2, 3, 4, 5];

const bgClass = (color: ScoreColor): string => `bg-${color}`;

// The risk palette as CSS custom properties, for SVG fill/stroke attributes
// where a class is not usable. Three weights: soft for large washes, the base
// pastel for fills, deep for line art (pastels wash out at stroke weight).
export const SCORE_SOFT_VAR: Record<ScoreColor, string> = {
  sage: "var(--sage-soft)",
  butter: "var(--butter-soft)",
  blush: "var(--blush-soft)",
};

export const SCORE_COLOR_VAR: Record<ScoreColor, string> = {
  sage: "var(--sage)",
  butter: "var(--butter)",
  blush: "var(--blush)",
};

export const SCORE_DEEP_VAR: Record<ScoreColor, string> = {
  sage: "var(--sage-deep)",
  butter: "var(--butter-deep)",
  blush: "var(--blush-deep)",
};

// Every number in the UI goes through here. <bdi> isolates it from the
// surrounding paragraph so digits and adjacent punctuation ("40%", "1–10",
// "5.56 / 10") keep their intended order when the page is RTL.
export function Num({ children }: { children: string }): JSX.Element {
  return <bdi className="num">{children}</bdi>;
}

// The canonical result display: five named levels, exactly one of them active.
//
// The Gauge this replaced filled every chip up to the score, so a level of 2 lit
// both "1" and "2" and read as a range rather than a state — and with no
// endpoint labels there was nothing to say which end was good.
export function LevelScale({ level }: { level: Level }): JSX.Element {
  const { lang, t } = useLanguage();
  const color = colorForScore(level);
  const name = t(LEVEL_KEY[level]);
  const max = formatNumber(lang, LEVEL_MAX, 0);
  const current = formatNumber(lang, level, 0);

  return (
    <div
      role="meter"
      aria-valuemin={1}
      aria-valuemax={LEVEL_MAX}
      aria-valuenow={level}
      aria-valuetext={t("level.meterText", { level: current, max, name })}
      aria-label={t("level.meterLabel")}
    >
      <div className="level-endpoints">
        <span>{t(LEVEL_ENDPOINT_KEY.low)}</span>
        <span>{t(LEVEL_ENDPOINT_KEY.high)}</span>
      </div>
      <div className="level-track">
        {LEVELS.map((n) => (
          <span
            key={n}
            aria-hidden="true"
            className={n === level ? `level-slot level-slot-active ${bgClass(color)}` : "level-slot"}
          >
            <Num>{formatNumber(lang, n, 0)}</Num>
          </span>
        ))}
      </div>
      <div className={`level-name c-${color}`}>{name}</div>
      <div className="level-caption">{t("level.caption", { level: current, max })}</div>
    </div>
  );
}

// One metric, one verdict: name, level, and a single line explaining what the
// level means for this metric.
export function MetricCard({
  title,
  level,
  note,
}: {
  title: string;
  level: Level;
  note: string;
}): JSX.Element {
  return (
    <div className="card" style={{ textAlign: "center" }}>
      <h3 style={{ marginBottom: "0.9rem" }}>{title}</h3>
      <LevelScale level={level} />
      <p style={{ margin: "0.9rem 0 0", color: "var(--cocoa-soft)" }}>{note}</p>
    </div>
  );
}

export function Pill({ color, children }: { color: ScoreColor; children: ReactNode }): JSX.Element {
  return (
    <span
      className={bgClass(color)}
      style={{ display: "inline-block", padding: "0.25em 0.9em", borderRadius: 999, color: "var(--cocoa)", fontWeight: 700, fontSize: "0.9rem" }}
    >
      {children}
    </span>
  );
}

export function ProgressBar({ step, total }: { step: number; total: number }): JSX.Element {
  const pct = Math.round((step / total) * 100);
  return (
    <div style={{ background: "var(--cream-deep)", borderRadius: 999, height: 10, overflow: "hidden" }}>
      <div className="bg-sage" style={{ width: `${pct}%`, height: "100%", transition: "width 0.3s ease" }} />
    </div>
  );
}

// Shown instead of a chart or a forecast when there is not enough data to draw
// one honestly, with progress toward the amount that unlocks it.
export function EmptyState({
  title,
  body,
  have,
  need,
}: {
  title: string;
  body: string;
  have: number;
  need: number;
}): JSX.Element {
  const { lang, t } = useLanguage();
  return (
    <div className="card" style={{ display: "flex", gap: "0.9rem", alignItems: "flex-start" }}>
      <Info size={22} color="var(--peach-deep)" style={{ flexShrink: 0, marginTop: 4 }} />
      <div style={{ flex: 1 }}>
        <strong>{title}</strong>
        <p style={{ margin: "0.3rem 0 0.8rem", color: "var(--cocoa-soft)" }}>{body}</p>
        <ProgressBar step={Math.min(have, need)} total={need} />
        <div style={{ marginTop: "0.4rem", color: "var(--cocoa-soft)", fontSize: "0.9rem" }}>
          <Num>
            {t("common.progressOf", {
              have: formatNumber(lang, have, 0),
              need: formatNumber(lang, need, 0),
            })}
          </Num>
        </div>
      </div>
    </div>
  );
}

// Groups related form fields so a long form reads as a few short ones.
export function FieldGroup({ legend, children }: { legend: string; children: ReactNode }): JSX.Element {
  return (
    <fieldset className="field-group">
      <legend>{legend}</legend>
      {children}
    </fieldset>
  );
}

// Raw model output (probabilities, thresholds, /10 scores) lives here rather
// than in the result card, where it competed with the verdict.
export function TechnicalDetails({ children }: { children: ReactNode }): JSX.Element {
  const { t } = useLanguage();
  return (
    <details className="tech-details">
      <summary>{t("common.technicalDetails")}</summary>
      <div className="tech-details-body">{children}</div>
    </details>
  );
}

export function RecommendationList({ items }: { items: Recommendation[] }): JSX.Element {
  const { t } = useLanguage();
  return (
    <div className="grid" style={{ gap: "0.8rem" }}>
      {items.map((rec) => (
        <div key={rec.key} className="card" style={{ padding: "1rem 1.2rem", borderInlineStart: "5px solid var(--peach)", display: "flex", gap: "0.8rem" }}>
          <Lightbulb size={22} color="var(--peach-deep)" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>{t(rec.titleKey)}</strong>
            <p style={{ margin: "0.3rem 0 0", color: "var(--cocoa-soft)" }}>{t(rec.bodyKey)}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ErrorNote({ message }: { message: string }): JSX.Element {
  const { t } = useLanguage();
  return (
    <div className="card bg-blush" style={{ color: "var(--cocoa)", padding: "0.9rem 1.2rem", display: "flex", gap: "0.6rem", alignItems: "center" }}>
      <AlertTriangle size={20} /> {t("common.error", { message })}
    </div>
  );
}
