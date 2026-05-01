/**
 * Trade-publication style masthead strip - "Volume X · Issue Y · Date".
 * Sits above the hero on key pages to set the editorial tone.
 */
export function Masthead({
  volume = "I",
  issue,
  edition = "Trade Edition",
  pubDate,
}: {
  volume?: string;
  issue?: string;
  edition?: string;
  pubDate?: string;
}) {
  const dateStr =
    pubDate ??
    new Date().toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="border-b border-[var(--color-rule)] bg-[var(--color-cream-soft)]">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
        <span>Volume {volume}</span>
        {issue ? <span className="hidden sm:inline">Issue {issue}</span> : null}
        <span className="hidden md:inline text-[var(--color-forest)]">
          {edition}
        </span>
        <span>{dateStr}</span>
      </div>
    </div>
  );
}
