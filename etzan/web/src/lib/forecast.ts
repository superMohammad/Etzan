import type { ScoreColor, ScoredDay, TrendForecast } from "./types";

const STEADY_BAND = 0.5; // points/day within which the trend is "flat"

function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// Fit a linear trend over the given series and project `horizon` days ahead.
export function forecastSeries(days: ScoredDay[], pick: (d: ScoredDay) => number, horizon: number): TrendForecast {
  const values = days.map(pick);
  const n = values.length;
  let slope = 0;
  let intercept = values[n - 1] ?? 50;
  if (n >= 2) {
    const xs = values.map((_, i) => i);
    const meanX = (n - 1) / 2;
    const meanY = values.reduce((a, b) => a + b, 0) / n;
    let num = 0;
    let den = 0;
    for (let i = 0; i < n; i++) {
      num += (xs[i] - meanX) * (values[i] - meanY);
      den += (xs[i] - meanX) ** 2;
    }
    slope = den === 0 ? 0 : num / den;
    intercept = meanY - slope * meanX;
  }

  const lastDate = days[n - 1].date;
  const projected = Array.from({ length: horizon }, (_, k) => {
    const index = n - 1 + (k + 1);
    const value = Math.max(0, Math.min(100, slope * index + intercept));
    return { date: addDays(lastDate, k + 1), value: Math.round(value * 10) / 10 };
  });

  let verdict: TrendForecast["verdict"];
  let verdictColor: ScoreColor;
  if (slope > STEADY_BAND) {
    verdict = "improving";
    verdictColor = "sage";
  } else if (slope < -STEADY_BAND) {
    verdict = "declining";
    verdictColor = "blush";
  } else {
    verdict = "steady";
    verdictColor = "butter";
  }

  return { slopePerDay: Math.round(slope * 100) / 100, verdict, verdictColor, projected };
}
