import Link from "next/link";
import { ScorePill } from "./ScorePill";
import { SponsoredBadge } from "./SponsoredBadge";
import { VendorLogo } from "./VendorLogo";

export function VendorCard({
  href,
  vendor,
  ourScore,
  sponsored,
}: {
  href: string;
  vendor: {
    name: string;
    websiteUrl: string;
    logoUrl?: string | null;
    tagline: string | null;
  };
  ourScore: number | null;
  sponsored: boolean;
}) {
  return (
    <Link
      href={href}
      className="group card glow-spotlight relative block rounded-2xl p-5"
    >
      {sponsored ? (
        <span className="absolute right-4 top-4">
          <SponsoredBadge subtle />
        </span>
      ) : null}
      <div className="flex items-start gap-4">
        <VendorLogo vendor={vendor} size={48} rounded="md" />
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-lg font-semibold leading-tight text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
            {vendor.name}
          </h3>
          {vendor.tagline ? (
            <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-[var(--fg-muted)]">
              {vendor.tagline}
            </p>
          ) : null}
        </div>
      </div>
      <div className="mt-5 flex items-end justify-between">
        <ScorePill score={ourScore} size="sm" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--fg-subtle)] transition-colors group-hover:text-[var(--accent)]">
          Read review →
        </span>
      </div>
    </Link>
  );
}
