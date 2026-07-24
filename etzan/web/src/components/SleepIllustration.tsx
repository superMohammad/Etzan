import type { Level } from "../lib/scoring";
import { colorForScore } from "../lib/scoring";
import { SCORE_COLOR_VAR, SCORE_DEEP_VAR, SCORE_SOFT_VAR } from "./ui";

// The night drawn as an arc from bedtime to wake-up. Every coloured element —
// the arc, the moon and the stars — takes its tone from the sleep-quality level,
// so the whole illustration reads as good / middling / poor at a glance rather
// than only the thin arc doing that work.

const NIGHT_ARC = "M40 170 A120 120 0 0 1 280 170";

// Two arcs meeting at the intersection points of an r=36 circle at (168,108)
// and an r=31 circle at (154,98) — a real crescent outline, so the stroke
// follows the moon's silhouette rather than two overlapping rings.
const CRESCENT = "M135.07 122.56 A36 36 0 1 0 171.09 72.12 A31 31 0 1 1 135.07 122.56 Z";

const STARS: { cx: number; cy: number; r: number }[] = [
  { cx: 70, cy: 70, r: 3 },
  { cx: 96, cy: 44, r: 2.2 },
  { cx: 240, cy: 56, r: 3 },
  { cx: 262, cy: 92, r: 2.2 },
  { cx: 212, cy: 34, r: 2.6 },
];

export default function SleepIllustration({
  level,
  bedtime,
  wakeUp,
  hours,
  label,
}: {
  level: Level;
  bedtime: string;
  wakeUp: string;
  hours: string;
  label: string;
}): JSX.Element {
  const score = colorForScore(level);
  const arcColor = SCORE_DEEP_VAR[score];
  const moonColor = SCORE_COLOR_VAR[score];
  const starColor = SCORE_SOFT_VAR[score];
  const fade = { transition: "fill 0.4s ease, stroke 0.4s ease" };

  return (
    <svg
      className="illustration"
      viewBox="0 0 320 210"
      role="img"
      aria-labelledby="sleep-illustration-title"
    >
      <title id="sleep-illustration-title">{label}</title>

      <path d={NIGHT_ARC} fill="none" stroke="var(--cream-deep)" strokeWidth={16} strokeLinecap="round" />
      <path
        className="illustration-outline"
        d={NIGHT_ARC}
        fill="none"
        stroke={arcColor}
        strokeWidth={16}
        strokeLinecap="round"
        style={fade}
      />

      <g className="illustration-breathe">
        <path
          d={CRESCENT}
          fill={moonColor}
          stroke="var(--cocoa)"
          strokeWidth={3.5}
          strokeLinejoin="round"
          style={fade}
        />
      </g>

      <g className="illustration-fade" fill={starColor} style={fade}>
        {STARS.map((star) => (
          <circle key={`${star.cx}-${star.cy}`} cx={star.cx} cy={star.cy} r={star.r} />
        ))}
      </g>

      <circle cx={40} cy={170} r={9} fill="var(--card)" stroke="var(--cocoa)" strokeWidth={3.5} />
      <circle cx={280} cy={170} r={9} fill="var(--card)" stroke="var(--cocoa)" strokeWidth={3.5} />

      {/* Clock times and the duration are Latin digits inside an LTR SVG text
          run, so they are not exposed to the page's RTL reordering. */}
      <text x={40} y={198} textAnchor="middle" fontSize={15} fontWeight={700} fill="var(--cocoa)">
        {bedtime}
      </text>
      <text x={280} y={198} textAnchor="middle" fontSize={15} fontWeight={700} fill="var(--cocoa)">
        {wakeUp}
      </text>
      <text x={160} y={166} textAnchor="middle" fontSize={19} fontWeight={700} fill="var(--cocoa)">
        {hours}
      </text>
    </svg>
  );
}
