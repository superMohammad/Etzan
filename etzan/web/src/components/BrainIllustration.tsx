import type { Level } from "../lib/scoring";
import { colorForScore } from "../lib/scoring";
import { SCORE_DEEP_VAR } from "./ui";
import { BRAIN_PATH, BRAIN_VIEWBOX } from "./brainPath";

// The brain result, drawn as anatomical line art that takes its colour from the
// result level: sage when things are good, butter in the middle, blush when they
// need attention. The whole drawing is one path, so the state reads instantly
// from across the room without needing to decode a chart.
//
// The -deep tones are used rather than the pastel fills: at line-art stroke
// weight the pastels wash out against the cream page.

export default function BrainIllustration({
  level,
  label,
}: {
  level: Level;
  label: string;
}): JSX.Element {
  const color = SCORE_DEEP_VAR[colorForScore(level)];

  return (
    <svg
      className="illustration illustration-breathe"
      viewBox={BRAIN_VIEWBOX}
      role="img"
      aria-labelledby="brain-illustration-title"
    >
      <title id="brain-illustration-title">{label}</title>
      <path d={BRAIN_PATH} fill={color} style={{ transition: "fill 0.4s ease" }} />
    </svg>
  );
}
