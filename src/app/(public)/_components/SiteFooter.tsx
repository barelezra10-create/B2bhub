import Link from "next/link";

const COLUMNS = [
  {
    title: "About",
    links: [
      { href: "/about", label: "Who we are" },
      { href: "/methodology", label: "How we evaluate" },
      { href: "/editorial-standards", label: "Editorial standards" },
      { href: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Coverage",
    links: [
      { href: "/debt-collection-software", label: "Debt collection" },
      { href: "/business-funding-software", label: "MCA / business funding" },
      { href: "/merchant-services", label: "Merchant services" },
      { href: "/pos-systems", label: "POS systems" },
      { href: "/peo-services", label: "PEO services" },
      { href: "/crm-software", label: "CRM software" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-24 border-t border-[var(--color-rule)] bg-[var(--color-cream-soft)]">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-[1.1fr_1fr_1fr]">
          <div>
            <Link href="/" className="font-display text-2xl font-semibold tracking-tight text-[var(--color-ink)]">
              The Hub
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-ink-muted)]">
              An editorial directory for the software businesses actually buy. Independent
              scores, real pros and cons, no fake awards.
            </p>
            <p className="mt-6 text-xs uppercase tracking-[0.18em] text-[var(--color-ink-subtle)]">
              Established 2026
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-display text-[13px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2 text-sm">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="link-underline text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--color-rule)] pt-6 text-xs text-[var(--color-ink-subtle)]">
          <p>(c) {year} The Hub. Editorial scores are our own. Some links may be sponsored.</p>
          <p className="font-mono uppercase tracking-[0.18em]">Independent. Honest. Useful.</p>
        </div>
      </div>
    </footer>
  );
}
