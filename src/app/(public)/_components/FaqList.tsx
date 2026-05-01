export function FaqList({
  items,
  title = "Frequently asked",
}: {
  items: { q: string; a: string }[];
  title?: string;
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-16">
      <header className="mb-6 flex items-baseline gap-4">
        <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--fg)]">
          {title}
        </h2>
        <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
          {items.length.toString().padStart(2, "0")} questions
        </span>
      </header>
      <dl className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
        {items.map((item, i) => (
          <div key={item.q} className="grid gap-3 py-6 md:grid-cols-[80px_1fr]">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
              Q{(i + 1).toString().padStart(2, "0")}
            </span>
            <div>
              <dt className="font-display text-lg font-semibold text-[var(--fg)]">
                {item.q}
              </dt>
              <dd className="mt-2 text-[15px] leading-relaxed text-[var(--fg-soft)]">
                {item.a}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
