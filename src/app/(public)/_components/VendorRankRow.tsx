import Link from "next/link";
import { ScorePill } from "./ScorePill";
import { SponsoredBadge } from "./SponsoredBadge";
import { VendorLogo } from "./VendorLogo";
import { SubScoreBar } from "./SubScoreBar";
import { computeSubScores } from "@/lib/sub-scores";

const RIBBONS: Record<number, { label: string; tone: string }> = {
  1: { label: "Best overall", tone: "chip-accent" },
  2: { label: "Runner-up", tone: "chip-mint" },
  3: { label: "Editor's pick", tone: "chip-sky" },
};

export function VendorRankRow({
  rank,
  href,
  vendor,
  pros,
  cons,
  bestForLabel,
  sponsored,
}: {
  rank: number;
  href: string;
  vendor: {
    slug: string;
    name: string;
    websiteUrl: string;
    logoUrl?: string | null;
    tagline: string | null;
    ourScore: number | null;
    pricingModel: string;
    pricingStartingAt: string | null;
    keyFeatures: string[];
    integrations: string[];
  };
  pros: string[];
  cons: string[];
  bestForLabel: string;
  sponsored: boolean;
}) {
  const ribbon = RIBBONS[rank];
  const sub = computeSubScores(vendor);

  return (
    <article className="card relative grid gap-6 p-6 md:grid-cols-[88px_minmax(0,1fr)_280px] md:p-7">
      {/* Rank numeral column */}
      <div className="flex flex-col items-start gap-3 md:items-center">
        <span className="font-display text-7xl font-bold leading-[0.85] text-gradient md:text-[5.5rem]">
          {rank.toString().padStart(2, "0")}
        </span>
        {ribbon ? <span className={`chip ${ribbon.tone}`}>{ribbon.label}</span> : null}
      </div>

      {/* Body column */}
      <div className="min-w-0">
        <header className="flex flex-wrap items-center gap-3">
          <VendorLogo vendor={vendor} size={48} rounded="md" />
          <div className="min-w-0">
            <Link
              href={href}
              className="font-display text-2xl font-bold leading-tight text-[var(--fg)] hover:text-[var(--accent)] md:text-[1.6rem]"
            >
              {vendor.name}
            </Link>
            <div className="mt-1 flex items-center gap-2">
              {sponsored ? <SponsoredBadge subtle /> : null}
              <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-muted)] font-semibold">
                Best for {bestForLabel}
              </span>
            </div>
          </div>
        </header>
        {vendor.tagline ? (
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--fg-soft)]">
            {vendor.tagline}
          </p>
        ) : null}

        {pros.length > 0 ? (
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {pros.slice(0, 4).map((p) => (
              <li
                key={p}
                className="flex items-start gap-2 text-[13px] text-[var(--fg)]"
              >
                <CheckIcon />
                <span>{p}</span>
              </li>
            ))}
          </ul>
        ) : null}

        {cons.length > 0 ? (
          <p className="mt-4 text-[12px] text-[var(--fg-muted)]">
            <span className="font-mono uppercase tracking-[0.18em] text-[var(--danger)] font-semibold">
              Watch out:
            </span>{" "}
            {cons[0]}
          </p>
        ) : null}
      </div>

      {/* Score + CTA column */}
      <div className="flex flex-col gap-4 md:items-stretch">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-elev)] p-4">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-muted)] font-semibold">
              Editorial
            </span>
            <ScorePill score={vendor.ourScore} size="md" />
          </div>
          <div className="mt-3 space-y-2">
            <SubScoreBar label="Ease of use" score={sub.easeOfUse} />
            <SubScoreBar label="Features" score={sub.features} />
            <SubScoreBar label="Value for money" score={sub.valueForMoney} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <a
            href={vendor.websiteUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="btn-primary justify-center"
          >
            Visit {vendor.name}
            <span aria-hidden>↗</span>
          </a>
          <Link href={href} className="btn-outline justify-center text-[13px]">
            Read full review
            <span aria-hidden>→</span>
          </Link>
        </div>

        {vendor.pricingStartingAt ? (
          <p className="text-center font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--fg-muted)]">
            From <span className="text-[var(--fg)] font-semibold">{vendor.pricingStartingAt}</span>
          </p>
        ) : null}
      </div>
    </article>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      className="mt-0.5 flex-shrink-0 text-[var(--accent)]"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="2,7 6,11 12,3" />
    </svg>
  );
}
