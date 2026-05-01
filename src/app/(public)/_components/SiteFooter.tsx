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
      { href: "/peo-services", label: "PEO" },
      { href: "/crm-software", label: "CRM" },
      { href: "/marketing-automation", label: "Marketing automation" },
      { href: "/project-management", label: "Project management" },
    ],
  },
  {
    title: "More",
    links: [
      { href: "/hr-software", label: "HR software" },
      { href: "/accounting-software", label: "Accounting" },
      { href: "/ecommerce-platforms", label: "E-commerce" },
      { href: "/cybersecurity", label: "Cybersecurity" },
      { href: "/analytics-platforms", label: "Analytics" },
      { href: "/help-desk-software", label: "Help desk" },
    ],
  },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-32 border-t border-[var(--border)] bg-[var(--bg-elev)]">
      <div className="container-x py-16">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white shadow-warm">
                <span className="font-display font-bold text-base leading-none">/</span>
              </span>
              <span className="font-display text-base font-bold tracking-tight text-[var(--fg)]">
                The Hub
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-[var(--fg-muted)]">
              B2B software, honestly compared. Independent scores, real pros and cons,
              no fake awards. Built for buyers who do their own homework.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs text-[var(--fg-muted)]">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-[var(--accent)] pulse-dot" aria-hidden />
              <span className="font-mono uppercase tracking-[0.18em]">Updated quarterly</span>
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-deep)]">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-2.5 text-[13px]">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="link-underline text-[var(--fg-soft)] hover:text-[var(--accent)]"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-[var(--border)] pt-6 text-xs text-[var(--fg-muted)]">
          <p>(c) {year} The Hub. Editorial scores are our own. Some links may be sponsored.</p>
          <p className="font-mono uppercase tracking-[0.2em]">Independent · Honest · Useful</p>
        </div>
      </div>
    </footer>
  );
}
