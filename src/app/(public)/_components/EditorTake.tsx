/**
 * Editorial verdict callout. Used on vendor profiles + comparison pages
 * to surface the take in a high-credibility "editor said this" voice.
 */
export function EditorTake({
  verdict,
  bestFor,
  skipIf,
  signature = "The Hub Editorial",
}: {
  verdict: string;
  bestFor?: string;
  skipIf?: string;
  signature?: string;
}) {
  return (
    <aside className="relative border border-[var(--border)] bg-[var(--bg-elev)] p-6">
      <span className="eyebrow">Editor&apos;s take</span>
      <p className="pullquote mt-4">{verdict}</p>
      <dl className="mt-6 grid gap-4 border-t border-[var(--border)] pt-4 text-sm md:grid-cols-2">
        {bestFor ? (
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
              Best for
            </dt>
            <dd className="mt-1 text-[var(--fg)]">{bestFor}</dd>
          </div>
        ) : null}
        {skipIf ? (
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--danger)]">
              Skip if
            </dt>
            <dd className="mt-1 text-[var(--fg)]">{skipIf}</dd>
          </div>
        ) : null}
      </dl>
      <p className="mt-6 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-subtle)]">
        — {signature}
      </p>
    </aside>
  );
}
