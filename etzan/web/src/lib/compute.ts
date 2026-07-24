// Derive the "hard" model inputs from friendly user answers, so users never
// enter engineered/encoded values directly.

export function bmiFrom(heightCm: number, weightKg: number): number {
  const m = heightCm / 100;
  return m > 0 ? weightKg / (m * m) : 0;
}

export const MINUTES_PER_DAY = 1440;

// Minutes since midnight for an HH:MM string.
export function minutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

// Sleep duration in hours from bedtime -> wake time (wraps past midnight).
export function durationHours(bedtime: string, wakeUp: string): number {
  let diff = minutes(wakeUp) - minutes(bedtime);
  if (diff <= 0) diff += 1440;
  return Math.round((diff / 60) * 100) / 100;
}

// Map a daily social-media hours value to firstlook's 0-5 bucket.
export function dailyTimeBucket(hours: number): number {
  if (hours < 1) return 0;
  if (hours < 2) return 1;
  if (hours < 3) return 2;
  if (hours < 4) return 3;
  if (hours < 5) return 4;
  return 5;
}
