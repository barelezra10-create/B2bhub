export function SponsoredBadge({ subtle = false }: { subtle?: boolean }) {
  if (subtle) {
    return (
      <span className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--gold)]">
        Sponsored
      </span>
    );
  }
  return (
    <span className="chip chip-gold">
      <span className="h-1 w-1 rounded-full bg-[var(--gold)]" aria-hidden />
      Sponsored
    </span>
  );
}
