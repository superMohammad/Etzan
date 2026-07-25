import type { ScoreColor, ScoredDay, TrendForecast } from "./types";

const STEADY_BAND = 0.5; // points/day within which the trend is "flat"
const DAY_MS = 86_400_000;

// Day-granular dates are parsed as UTC everywhere in this module. Stepping one
// through a LOCAL-midnight Date and serialising it with toISOString() (which is
// UTC) lands on the previous day everywhere east of UTC: in Asia/Riyadh,
// addDays("2026-07-25", 1) returned "2026-07-25". That collided the first
// projection with the last logged day and cost the series a day at the far end.
function utcMs(isoDate: string): number {
  const ms = Date.parse(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(ms)) throw new Error(`Invalid ISO date '${isoDate}'`);
  return ms;
}

function addDays(isoDate: string, days: number): string {
  return new Date(utcMs(isoDate) + days * DAY_MS).toISOString().slice(0, 10);
}

const clampScore = (value: number): number => Math.max(0, Math.min(100, value));

// Fit a linear trend over the given series and project `horizon` days ahead.
export function forecastSeries(days: ScoredDay[], pick: (d: ScoredDay) => number, horizon: number): TrendForecast {
  const values = days.map(pick);
  const n = values.length;
  if (n === 0) throw new Error("forecastSeries needs at least one scored day");

  // Regress against ELAPSED DAYS, not array position. The tracker keeps one
  // entry per logged day and skips the rest, so position and date only agree
  // while nothing is missed. Fitting on position yielded a slope per *entry*
  // that was then applied per *calendar day* below — a week with a five-day
  // hole in it understated the trend by the width of the hole.
  const originMs = utcMs(days[0].date);
  const xs = days.map((d) => (utcMs(d.date) - originMs) / DAY_MS);

  let slope = 0;
  if (n >= 2) {
    const meanX = xs.reduce((a, b) => a + b, 0) / n;
    const meanY = values.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - meanX) * (values[i] - meanY);
      den += (xs[i] - meanX) ** 2;
    }
    slope = den === 0 ? 0 : num / den;
  }

  // Anchored at the last OBSERVED value, not at the fitted line's value there.
  // Evaluating the regression at the projected indices started the dashed line
  // wherever the fit happened to sit on the final day — on a week that dips and
  // recovers that is far below the point the solid line ends on, so the two
  // series met at a visible step and the drawn line contradicted the badge.
  const lastValue = values[n - 1];
  const lastDate = days[n - 1].date;
  const projected = Array.from({ length: horizon }, (_, k) => ({
    date: addDays(lastDate, k + 1),
    value: Math.round(clampScore(lastValue + slope * (k + 1)) * 10) / 10,
  }));

  // Read off the endpoint that is actually drawn — including any clamping — so
  // the badge cannot disagree with the line above it.
  const drift = projected[horizon - 1].value - lastValue;
  const band = STEADY_BAND * horizon;

  let verdict: TrendForecast["verdict"];
  let verdictColor: ScoreColor;
  if (drift > band) {
    verdict = "improving";
    verdictColor = "sage";
  } else if (drift < -band) {
    verdict = "declining";
    verdictColor = "blush";
  } else {
    verdict = "steady";
    verdictColor = "butter";
  }

  return { slopePerDay: Math.round(slope * 100) / 100, verdict, verdictColor, projected };
}
