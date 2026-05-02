/**
 * Horizontal bar showing a single sub-score (0-10).
 * Mark a winner by passing `winner` so it tints accent.
 */
export function SubScoreBar({
  label,
  score,
  winner,
  alignNumber = "right",
}: {
  label?: string;
  score: number;
  winner?: boolean;
  alignNumber?: "left" | "right";
}) {
  const pct = Math.max(0, Math.min(100, (score / 10) * 100));
  const fillColor = winner
    ? "bg-[var(--accent)]"
    : score >= 8
    ? "bg-[var(--pastel-coral)]"
    : score >= 6
    ? "bg-[var(--pastel-peach)]"
    : "bg-[var(--bg-elev-2)]";

  return (
    <div>
      {label ? (
        <div className="mb-1.5 flex items-baseline justify-between gap-2">
          <span
            className={`text-[12px] font-semibold ${
              winner ? "text-[var(--accent)]" : "text-[var(--fg)]"
            }`}
          >
            {label}
          </span>
          <span
            className={`font-mono text-[11px] font-semibold ${
              winner ? "text-[var(--accent)]" : "text-[var(--fg-muted)]"
            }`}
          >
            {score.toFixed(1)}
          </span>
        </div>
      ) : null}
      <div className="relative h-2.5 overflow-hidden rounded-full bg-[var(--bg-elev)]">
        <div
          className={`absolute inset-y-0 left-0 ${fillColor} transition-[width] duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {!label ? (
        <p
          className={`mt-1 font-mono text-[11px] ${alignNumber === "right" ? "text-right" : "text-left"} ${
            winner ? "text-[var(--accent)] font-semibold" : "text-[var(--fg-muted)]"
          }`}
        >
          {score.toFixed(1)}
        </p>
      ) : null}
    </div>
  );
}
