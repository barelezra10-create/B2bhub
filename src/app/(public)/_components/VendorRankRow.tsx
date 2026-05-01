import Link from "next/link";
import { ScorePill } from "./ScorePill";
import { SponsoredBadge } from "./SponsoredBadge";
import { VendorLogo } from "./VendorLogo";

const RIBBONS: Record<number, string> = {
  1: "Best overall",
  2: "Runner-up",
  3: "Third pick",
};

export function VendorRankRow({
  rank,
  href,
  vendor,
  ourScore,
  pricingStartingAt,
  pros,
  cons,
  bestForLabel,
  sponsored,
}: {
  rank: number;
  href: string;
  vendor: {
    name: string;
    websiteUrl: string;
    logoUrl?: string | null;
    tagline: string | null;
  };
  ourScore: number | null;
  pricingStartingAt: string | null;
  pros: string[];
  cons: string[];
  bestForLabel: string;
  sponsored: boolean;
}) {
  const ribbon = RIBBONS[rank];

  return (
    <article className="relative grid gap-6 border border-[var(--color-rule)] bg-[var(--color-cream)] p-7 md:grid-cols-[110px_1fr_auto] card-lift">
      {/* Rank numeral */}
      <div className="flex flex-col items-start gap-2 md:items-center">
        <span
          className="font-display text-7xl font-semibold leading-[0.85] text-[var(--color-forest)] md:text-8xl"
          style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
        >
          {rank.toString().padStart(2, "0")}
        </span>
        {ribbon ? (
          <span className="inline-flex items-center border border-[var(--color-gold-deep)] bg-[var(--color-gold-soft)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-gold-deep)]">
            {ribbon}
          </span>
        ) : null}
      </div>

      {/* Body */}
      <div className="min-w-0">
        <header className="flex flex-wrap items-center gap-3">
          <VendorLogo vendor={vendor} size={40} rounded="md" />
          <Link
            href={href}
            className="font-display text-2xl font-semibold leading-tight text-[var(--color-ink)] hover:text-[var(--color-forest)]"
          >
            {vendor.name}
          </Link>
          {sponsored ? <SponsoredBadge /> : null}
        </header>
        {vendor.tagline ? (
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
            {vendor.tagline}
          </p>
        ) : null}

        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-forest)]">
              Pros
            </dt>
            <ul className="mt-2 space-y-1 text-sm text-[var(--color-ink)]">
              {pros.slice(0, 3).map((p) => (
                <li key={p} className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1 w-3 flex-shrink-0 bg-[var(--color-forest)]" aria-hidden />
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-rust)]">
              Cons
            </dt>
            <ul className="mt-2 space-y-1 text-sm text-[var(--color-ink)]">
              {cons.slice(0, 3).map((c) => (
                <li key={c} className="flex gap-2">
                  <span className="mt-1.5 inline-block h-1 w-3 flex-shrink-0 bg-[var(--color-rust)]" aria-hidden />
                  <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </dl>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-[var(--color-rule-soft)] pt-4 text-xs text-[var(--color-ink-muted)]">
          <span className="font-mono uppercase tracking-[0.2em]">
            Best for{" "}
            <span className="text-[var(--color-ink)]">{bestForLabel}</span>
          </span>
          {pricingStartingAt ? (
            <span className="font-mono uppercase tracking-[0.2em]">
              From <span className="text-[var(--color-ink)]">{pricingStartingAt}</span>
            </span>
          ) : null}
          <Link
            href={href}
            className="ml-auto font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-forest)] link-underline"
          >
            Full review →
          </Link>
        </div>
      </div>

      {/* Score column */}
      <div className="flex items-start justify-end md:items-center">
        <ScorePill score={ourScore} size="lg" />
      </div>
    </article>
  );
}
