import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid, Legend, Line, LineChart, ReferenceLine,
  ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
// FolderOpen rather than Upload for the import: an upward arrow reads as
// "send my data somewhere", which is the opposite of what this app does.
import { Download, FolderOpen } from "lucide-react";
import { exportJson, importJson, saveLog, scoredLogs } from "../lib/tracking";
import { forecastSeries } from "../lib/forecast";
import { LEVEL_KEY, levelFromBalance100, toLevel } from "../lib/scoring";
import { formatDateLong, formatDateShort, formatDays, formatDaysLogged, formatNumber, formatRange } from "../lib/format";
import { useLanguage } from "../lib/i18n";
import type { MessageKey } from "../lib/i18n";
import { usePageMeta } from "../lib/usePageMeta";
import type { DailyLog, ScoredDay } from "../lib/types";
import { EmptyState, ErrorNote, FieldGroup, MetricCard, Num, Pill } from "../components/ui";

const DAY_MS = 86_400_000;

// Local calendar day. toISOString() is UTC, so east of UTC it names yesterday
// for the first hours of every morning — the tracker would then default to
// logging the wrong day.
const today = (): string => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
};

// Day-granular ISO dates are placed on a real time axis, so a skipped day leaves
// a real gap. Parsed as UTC to match how the axis ticks are generated.
const dayStamp = (isoDate: string): number => Date.parse(`${isoDate}T00:00:00Z`);
const stampToIso = (ms: number): string => new Date(ms).toISOString().slice(0, 10);

// One label per day is unreadable past a week, so thin them to at most eight
// while keeping every tick on a real day boundary. Stepping back from the last
// day rather than forward from the first guarantees the far end is labelled —
// on the forecast chart that is the projected day the caption promises, and
// leaving it unlabelled reads as the axis stopping short of the data.
const dayTicks = (fromMs: number, toMs: number): number[] => {
  const span = Math.round((toMs - fromMs) / DAY_MS) + 1;
  const stride = Math.max(1, Math.ceil(span / 8)) * DAY_MS;
  const ticks: number[] = [];
  for (let ms = toMs; ms >= fromMs; ms -= stride) ticks.unshift(ms);
  return ticks;
};

// Two points cannot describe a trend and two days cannot support a projection;
// drawing them anyway is what made a straight line across the chart and a
// confident "7 days from now" number look like real analysis.
const MIN_TREND_DAYS = 3;
const MIN_FORECAST_DAYS = 7;

const SERIES_BRAIN = "#8a6db1";
const SERIES_SLEEP = "#3f7f96";
const SERIES_ACTUAL = "#e88a5f";
const SERIES_PROJECTED = "#7fa87c";

const EMPTY: DailyLog = {
  date: today(), sleep_hours: 7, screen_time_hrs: 5, social_media_hours: 2,
  stress: 5, caffeine_mg: 80, exercise: 0, felt_rested: 1, compulsive_use: 3,
};

const VERDICT_KEY: Record<string, MessageKey> = {
  improving: "dash.verdict.improving",
  steady: "dash.verdict.steady",
  declining: "dash.verdict.declining",
};

const levelPosition = (balance0to100: number): number =>
  Math.round(levelFromBalance100(balance0to100) * 100) / 100;

function NumberField({
  label,
  hint,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  hint: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}): JSX.Element {
  const { lang, t } = useLanguage();
  const invalid = value < min || value > max;
  const range = formatRange(lang, min, max);
  return (
    <div className="field">
      <label>{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-invalid={invalid}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {invalid
        ? <span className="field-error"><Num>{t("dash.outOfRange", { range })}</Num></span>
        : <span className="hint"><Num>{t("dash.fieldHint", { hint, range })}</Num></span>}
    </div>
  );
}

function RangeField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}): JSX.Element {
  const { lang, t } = useLanguage();
  return (
    <div className="field">
      <label>
        {label}
        <span className="hint">
          <Num>
            {t("dash.rangeHint", {
              range: formatRange(lang, min, max),
              value: formatNumber(lang, value, 0),
            })}
          </Num>
        </span>
      </label>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}

export default function Dashboard(): JSX.Element {
  const { lang, t } = useLanguage();
  usePageMeta("meta.dashboard.title", "meta.dashboard.description");

  const [logs, setLogs] = useState<ScoredDay[]>(() => scoredLogs());
  const [entry, setEntry] = useState<DailyLog>(EMPTY);
  const [horizon, setHorizon] = useState(7);
  const [error, setError] = useState<string | null>(null);
  const [saveCount, setSaveCount] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Counts saves rather than holding a flag, so two saves in a row each scroll
  // and each replay the highlight.
  useEffect(() => {
    if (saveCount === 0) return;
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [saveCount]);

  function set<K extends keyof DailyLog>(key: K, value: DailyLog[K]): void {
    setEntry((prev) => ({ ...prev, [key]: value }));
  }

  const windowed = useMemo(() => logs.slice(-horizon), [logs, horizon]);
  const canTrend = windowed.length >= MIN_TREND_DAYS;
  const canForecast = windowed.length >= MIN_FORECAST_DAYS;
  const forecast = canForecast ? forecastSeries(windowed, (d) => d.balance, horizon) : null;
  const last = windowed[windowed.length - 1];

  const brainSeries = t("dash.series.brain");
  const sleepSeries = t("dash.series.sleep");
  const levelTick = (value: number): string => t(LEVEL_KEY[toLevel(value)]);
  const tickDate = (ms: number): string => formatDateShort(lang, stampToIso(ms));

  const trendData = windowed.map((d) => ({
    ts: dayStamp(d.date),
    [brainSeries]: levelPosition(d.brainScore),
    [sleepSeries]: levelPosition(d.sleepScore),
  }));
  const trendTicks = trendData.length
    ? dayTicks(trendData[0].ts, trendData[trendData.length - 1].ts)
    : [];

  // The last actual point carries the first projected value too, so the solid
  // and dashed lines share one point instead of leaving a gap between them.
  const balanceData = forecast
    ? [
        ...windowed.map((d, i) => ({
          ts: dayStamp(d.date),
          actual: levelPosition(d.balance),
          projected: i === windowed.length - 1 ? levelPosition(d.balance) : null,
        })),
        ...forecast.projected.map((p) => ({
          ts: dayStamp(p.date),
          actual: null as number | null,
          projected: levelPosition(p.value),
        })),
      ]
    : [];
  const balanceTicks = balanceData.length
    ? dayTicks(balanceData[0].ts, balanceData[balanceData.length - 1].ts)
    : [];

  function submit(): void {
    setError(null);
    saveLog(entry);
    setLogs(scoredLogs());
    setSaveCount((n) => n + 1);
  }

  async function onImport(file: File): Promise<void> {
    setError(null);
    try {
      await importJson(file);
      setLogs(scoredLogs());
    } catch {
      setError(t("error.invalidBackup"));
    }
  }

  return (
    <div className="container" style={{ maxWidth: 880, paddingTop: "2rem" }}>
      <h1 style={{ margin: 0, fontSize: "1.8rem" }}>{t("dash.pageTitle")}</h1>
      <p style={{ color: "var(--cocoa-soft)" }}>{t("dash.intro")}</p>

      {/* Backup and restore are rare actions, so they sit under the title as a
          secondary toolbar rather than sharing its row, where they collided with
          it at medium widths. */}
      <div className="toolbar">
        <button className="btn btn-ghost" onClick={exportJson} style={{ padding: "0.5em 1em" }}>
          <Download size={16} /> {t("dash.backup")}
        </button>
        <button className="btn btn-ghost" onClick={() => fileRef.current?.click()} style={{ padding: "0.5em 1em" }}>
          <FolderOpen size={16} /> {t("dash.restore")}
        </button>
        <input ref={fileRef} type="file" accept="application/json" hidden
          onChange={(e) => e.target.files?.[0] && onImport(e.target.files[0])} />
      </div>

      {error && <ErrorNote message={error} />}

      {/* Log first, then read the result. The form used to sit below everything
          it produces, so saving a day scrolled nothing and the new numbers were
          off-screen above. */}
      <div className="card">
        <h2 className="section-heading">{t("dash.logTitle")}</h2>

        <div className="field">
          <label htmlFor="log-date">{t("dash.field.date")}</label>
          {/* The native date control renders in the browser's own locale and
              direction; forcing LTR keeps it from fighting an RTL page, and the
              readout beside it removes the ambiguity of 07/25/2026. */}
          <input id="log-date" type="date" dir="ltr" style={{ textAlign: "start" }}
            value={entry.date} onChange={(e) => set("date", e.target.value)} />
          <span className="hint">{formatDateLong(lang, entry.date)}</span>
        </div>

        <FieldGroup legend={t("dash.group.sleep")}>
          <div className="grid grid-2">
            <NumberField label={t("dash.field.sleepHours")} hint={t("dash.field.sleepHoursHint")}
              value={entry.sleep_hours} min={0} max={14} step={0.5} onChange={(v) => set("sleep_hours", v)} />
            <div className="field"><label>{t("dash.field.feltRested")}</label>
              <select value={entry.felt_rested} onChange={(e) => set("felt_rested", Number(e.target.value))}>
                <option value={1}>{t("common.yes")}</option><option value={0}>{t("common.no")}</option></select></div>
          </div>
        </FieldGroup>

        <FieldGroup legend={t("dash.group.screen")}>
          <div className="grid grid-2">
            <NumberField label={t("dash.field.screenHours")} hint={t("dash.field.screenHoursHint")}
              value={entry.screen_time_hrs} min={0} max={18} step={0.5} onChange={(v) => set("screen_time_hrs", v)} />
            <NumberField label={t("dash.field.socialHours")} hint={t("dash.field.socialHoursHint")}
              value={entry.social_media_hours} min={0} max={12} step={0.5} onChange={(v) => set("social_media_hours", v)} />
            <RangeField label={t("dash.field.compulsive")} value={entry.compulsive_use}
              min={1} max={5} onChange={(v) => set("compulsive_use", v)} />
          </div>
        </FieldGroup>

        <FieldGroup legend={t("dash.group.day")}>
          <div className="grid grid-2">
            <RangeField label={t("dash.field.stress")} value={entry.stress} min={1} max={10}
              onChange={(v) => set("stress", v)} />
            <NumberField label={t("dash.field.caffeine")} hint={t("dash.field.caffeineHint")}
              value={entry.caffeine_mg} min={0} max={600} step={10} onChange={(v) => set("caffeine_mg", v)} />
            <div className="field"><label>{t("dash.field.exercise")}</label>
              <select value={entry.exercise} onChange={(e) => set("exercise", Number(e.target.value))}>
                <option value={0}>{t("common.no")}</option><option value={1}>{t("common.yes")}</option></select></div>
          </div>
        </FieldGroup>

        <button className="btn" onClick={submit}>{t("dash.save")}</button>
        <span style={{ marginInlineStart: "1rem", color: "var(--cocoa-soft)" }}>
          <Num>{formatDaysLogged(lang, t, logs.length)}</Num>
        </span>
      </div>

      {/* Remounted on every save so the highlight animation replays. */}
      <div key={saveCount} ref={resultsRef}
        className={saveCount > 0 ? "results-stack results-flash" : "results-stack"}>
      <div style={{ display: "flex", gap: "0.6rem" }}>
        {[7, 30].map((h) => (
          <button key={h} className={horizon === h ? "btn" : "btn btn-ghost"} onClick={() => setHorizon(h)}>
            <Num>{t("dash.horizon", { days: formatDays(lang, t, h) })}</Num>
          </button>
        ))}
      </div>

      {!canTrend && (
        <EmptyState
          title={t("dash.empty.trendTitle")}
          body={t("dash.empty.trendBody", { days: formatDays(lang, t, MIN_TREND_DAYS) })}
          have={windowed.length}
          need={MIN_TREND_DAYS}
        />
      )}

      {canTrend && last && (
        <>
          {/* Section heading so the card <h3>s do not precede the first <h2>. */}
          <h2 className="section-heading">{t("dash.summaryTitle")}</h2>
          <div className="grid grid-2">
            <MetricCard
              title={t("dash.balanceTitle")}
              level={toLevel(levelFromBalance100(last.balance))}
              note={t("dash.balanceNote", { date: formatDateLong(lang, last.date) })}
            />
            <div className="card">
              <h3 style={{ textAlign: "center" }}>{t("dash.sidesTitle")}</h3>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {[
                  { name: brainSeries, color: SERIES_BRAIN, score: last.brainScore },
                  { name: sleepSeries, color: SERIES_SLEEP, score: last.sleepScore },
                ].map((side) => (
                  <li key={side.name} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.6rem 0" }}>
                    {/* marginInlineEnd as well as the gap: the swatch must not
                        touch the label in either direction. */}
                    <span style={{ width: 14, height: 14, borderRadius: 4, background: side.color, flexShrink: 0, marginInlineEnd: "0.2rem" }} aria-hidden="true" />
                    <span style={{ flex: 1 }}>{side.name}</span>
                    <strong>{t(LEVEL_KEY[toLevel(levelFromBalance100(side.score))])}</strong>
                  </li>
                ))}
              </ul>
              <p style={{ margin: "0.4rem 0 0", color: "var(--cocoa-soft)", fontSize: "0.9rem" }}>
                {t("dash.sidesNote")}
              </p>
            </div>
          </div>

          <div className="card">
            <h2 className="section-heading">{t("dash.trendTitle")}</h2>
            <p style={{ marginTop: 0, color: "var(--cocoa-soft)" }}>{t("dash.trendIntro")}</p>
            <div style={{ direction: "ltr", width: "100%", height: 280 }}>
              <ResponsiveContainer>
                <LineChart data={trendData} margin={{ top: 10, right: 20, bottom: 10, left: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="ts" type="number" scale="time"
                    domain={[trendData[0].ts, trendData[trendData.length - 1].ts]}
                    ticks={trendTicks} tick={{ fontSize: 11 }}
                    padding={{ left: 24, right: 24 }} tickFormatter={tickDate} />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} reversed width={104}
                    tick={{ fontSize: 11 }} tickFormatter={levelTick} />
                  <Tooltip formatter={(v: number) => levelTick(v)}
                    labelFormatter={(ms: number) => formatDateLong(lang, stampToIso(ms))} />
                  <Legend />
                  <Line type="monotone" dataKey={brainSeries} stroke={SERIES_BRAIN} strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey={sleepSeries} stroke={SERIES_SLEEP} strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}

      {!canForecast && (
        <EmptyState
          title={t("dash.empty.forecastTitle")}
          body={t("dash.empty.forecastBody", { days: formatDays(lang, t, MIN_FORECAST_DAYS) })}
          have={windowed.length}
          need={MIN_FORECAST_DAYS}
        />
      )}

      {canForecast && forecast && (
        <div className="card">
          <h2 className="section-heading">{t("dash.forecastTitle")}</h2>
          <p style={{ marginTop: 0, color: "var(--cocoa-soft)" }}>{t("dash.forecastIntro")}</p>
          <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", flexWrap: "wrap", marginBottom: "0.6rem" }}>
            <Pill color={forecast.verdictColor}>{t(VERDICT_KEY[forecast.verdict])}</Pill>
            <span style={{ color: "var(--cocoa-soft)" }}>
              <Num>{t("dash.forecastVerdict", { days: formatDays(lang, t, horizon) })}</Num>{" "}
              <strong>
                {t(LEVEL_KEY[toLevel(levelFromBalance100(forecast.projected[forecast.projected.length - 1].value))])}
              </strong>
            </span>
          </div>
          <div style={{ direction: "ltr", width: "100%", height: 280 }}>
            <ResponsiveContainer>
              <LineChart data={balanceData} margin={{ top: 10, right: 20, bottom: 10, left: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                <XAxis dataKey="ts" type="number" scale="time"
                  domain={[balanceData[0].ts, balanceData[balanceData.length - 1].ts]}
                  ticks={balanceTicks} tick={{ fontSize: 11 }} tickFormatter={tickDate} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} reversed width={104}
                  tick={{ fontSize: 11 }} tickFormatter={levelTick} />
                <Tooltip formatter={(v: number) => levelTick(v)}
                  labelFormatter={(ms: number) => formatDateLong(lang, stampToIso(ms))} />
                <Legend />
                <ReferenceLine y={3} stroke="#e6c26a" strokeDasharray="4 4" />
                <Line name={t("dash.legend.actual")} type="monotone" dataKey="actual" stroke={SERIES_ACTUAL}
                  strokeWidth={3} connectNulls={false} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
                <Line name={t("dash.legend.projected")} type="monotone" dataKey="projected" stroke={SERIES_PROJECTED}
                  strokeWidth={3} strokeDasharray="6 4" connectNulls={false} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p style={{ marginBottom: 0, color: "var(--cocoa-soft)", fontSize: "0.9rem" }}>
            {t("dash.forecastCaveat")}
          </p>
        </div>
      )}

      </div>
    </div>
  );
}
