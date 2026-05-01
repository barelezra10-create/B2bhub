export function ScorePill({
  score,
  size = "md",
}: {
  score: number | null;
  size?: "sm" | "md" | "lg";
}) {
  if (score === null) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
        Unrated
      </span>
    );
  }

  const sizes = {
    sm: { box: "h-9 w-12", num: "text-base", suf: "text-[8px]" },
    md: { box: "h-12 w-16", num: "text-xl", suf: "text-[9px]" },
    lg: { box: "h-16 w-20", num: "text-3xl", suf: "text-[10px]" },
  } as const;
  const s = sizes[size];

  // 8.5+ = vibrant orange; 7+ = peach; below = soft cream
  const tone =
    score >= 8.5
      ? "bg-[var(--accent)] text-white border-[var(--accent-deep)] shadow-[0_4px_12px_-2px_var(--accent-glow)]"
      : score >= 7
      ? "bg-[var(--pastel-peach)] text-[var(--accent-deep)] border-[var(--accent)]"
      : "bg-[var(--bg-elev)] text-[var(--fg-muted)] border-[var(--border)]";

  return (
    <span
      className={`relative inline-flex flex-col items-center justify-center rounded-md border ${tone} ${s.box} score-pop`}
      aria-label={`Score ${score.toFixed(1)} out of 10`}
    >
      <span className={`font-mono font-semibold leading-none ${s.num}`}>
        {score.toFixed(1)}
      </span>
      <span className={`mt-0.5 font-mono uppercase tracking-[0.15em] opacity-70 ${s.suf}`}>
        / 10
      </span>
    </span>
  );
}
