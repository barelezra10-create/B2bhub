import Link from "next/link";
import { ScorePill } from "./ScorePill";
import { SponsoredBadge } from "./SponsoredBadge";

export function VendorCard({
  href,
  name,
  tagline,
  ourScore,
  sponsored,
}: {
  href: string;
  name: string;
  tagline: string | null;
  ourScore: number | null;
  sponsored: boolean;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">{name}</h3>
        <ScorePill score={ourScore} />
      </div>
      {tagline ? <p className="mt-2 line-clamp-2 text-sm text-slate-600">{tagline}</p> : null}
      {sponsored ? <div className="mt-3"><SponsoredBadge /></div> : null}
    </Link>
  );
}
