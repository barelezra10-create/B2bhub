import Link from "next/link";
import { ScorePill } from "./ScorePill";
import { SponsoredBadge } from "./SponsoredBadge";

export function VendorRankRow({
  rank,
  href,
  name,
  tagline,
  ourScore,
  pricingStartingAt,
  pros,
  cons,
  bestForLabel,
  sponsored,
}: {
  rank: number;
  href: string;
  name: string;
  tagline: string | null;
  ourScore: number | null;
  pricingStartingAt: string | null;
  pros: string[];
  cons: string[];
  bestForLabel: string;
  sponsored: boolean;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6">
      <header className="flex flex-wrap items-center gap-3">
        <span className="text-3xl font-bold text-slate-300">#{rank}</span>
        <Link href={href} className="text-xl font-semibold text-slate-900 hover:underline">
          {name}
        </Link>
        <ScorePill score={ourScore} />
        {sponsored ? <SponsoredBadge /> : null}
      </header>
      {tagline ? <p className="mt-2 text-sm text-slate-600">{tagline}</p> : null}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pros</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {pros.slice(0, 3).map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cons</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {cons.slice(0, 3).map((c) => <li key={c}>{c}</li>)}
          </ul>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span>Best for: <span className="text-slate-700">{bestForLabel}</span></span>
        {pricingStartingAt ? <span>From <span className="text-slate-700">{pricingStartingAt}</span></span> : null}
      </div>
      <div className="mt-4">
        <Link href={href} className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
          See details
        </Link>
      </div>
    </article>
  );
}
