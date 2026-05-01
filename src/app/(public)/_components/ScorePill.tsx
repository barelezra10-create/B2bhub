export function ScorePill({
  score,
  size = "md",
}: {
  score: number | null;
  size?: "sm" | "md" | "lg";
}) {
  if (score === null) {
    return (
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--color-ink-subtle)]">
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

  // High scores get a gold-deep frame; lower a forest-soft one
  const tone =
    score >= 8.5
      ? "bg-[var(--color-gold)] text-[var(--color-ink)] border-[var(--color-gold-deep)]"
      : score >= 7
      ? "bg-[var(--color-forest)] text-[var(--color-cream)] border-[var(--color-forest-deep)]"
      : "bg-[var(--color-cream-soft)] text-[var(--color-ink-soft)] border-[var(--color-rule)]";

  return (
    <span
      className={`relative inline-flex flex-col items-center justify-center border ${tone} ${s.box} score-pop`}
      aria-label={`Score ${score.toFixed(1)} out of 10`}
    >
      <span className={`font-mono font-semibold leading-none ${s.num}`}>
        {score.toFixed(1)}
      </span>
      <span className={`mt-0.5 font-mono uppercase tracking-[0.15em] opacity-75 ${s.suf}`}>
        / 10
      </span>
    </span>
  );
}
