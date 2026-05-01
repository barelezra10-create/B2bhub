export function SponsoredBadge({ subtle = false }: { subtle?: boolean }) {
  if (subtle) {
    return (
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-gold-deep)]">
        Sponsored
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 border border-[var(--color-gold-deep)] bg-[var(--color-gold-soft)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--color-gold-deep)]">
      <span className="h-1 w-1 rounded-full bg-[var(--color-gold-deep)]" aria-hidden />
      Sponsored
    </span>
  );
}
