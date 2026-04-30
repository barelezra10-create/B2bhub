import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Markdown } from "@/lib/markdown";
import { PageHero } from "../../_components/PageHero";
import { ScorePill } from "../../_components/ScorePill";

export const revalidate = 3600;

const SEGMENT_LABELS: Record<string, string> = {
  smb: "SMB",
  mid_market: "Mid-market",
  enterprise: "Enterprise",
  all: "All sizes",
};

const PRICING_LABELS: Record<string, string> = {
  free: "Free",
  freemium: "Freemium",
  paid: "Paid",
  quote: "Quote / Custom",
};

export async function generateStaticParams() {
  const comparisons = await db.comparison.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cmp = await db.comparison.findUnique({
    where: { slug },
    include: { vendorA: true, vendorB: true },
  });
  if (!cmp) return {};
  return {
    title: `${cmp.vendorA.name} vs ${cmp.vendorB.name} | The Hub`,
    description: cmp.summaryCopy?.slice(0, 160) ?? `Side-by-side comparison of ${cmp.vendorA.name} and ${cmp.vendorB.name}.`,
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cmp = await db.comparison.findUnique({
    where: { slug },
    include: {
      vendorA: { include: { category: true } },
      vendorB: { include: { category: true } },
    },
  });
  if (!cmp || !cmp.isPublished) notFound();

  const { vendorA: a, vendorB: b } = cmp;

  const rows: { label: string; a: React.ReactNode; b: React.ReactNode }[] = [
    {
      label: "Score",
      a: <ScorePill score={a.ourScore} />,
      b: <ScorePill score={b.ourScore} />,
    },
    {
      label: "Pricing",
      a: a.pricingStartingAt ?? PRICING_LABELS[a.pricingModel] ?? a.pricingModel,
      b: b.pricingStartingAt ?? PRICING_LABELS[b.pricingModel] ?? b.pricingModel,
    },
    {
      label: "Best for",
      a: SEGMENT_LABELS[a.bestForSegment] ?? a.bestForSegment,
      b: SEGMENT_LABELS[b.bestForSegment] ?? b.bestForSegment,
    },
    {
      label: "HQ",
      a: a.hqLocation ?? "-",
      b: b.hqLocation ?? "-",
    },
    {
      label: "Founded",
      a: a.foundedYear ?? "-",
      b: b.foundedYear ?? "-",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Comparison"
        title={`${a.name} vs ${b.name}`}
        description={cmp.hookCopy ?? undefined}
      />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <ComparisonHeader vendor={a} />
          <ComparisonHeader vendor={b} />
        </div>

        {cmp.summaryCopy ? (
          <section className="mt-10 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick verdict</h2>
            <Markdown>{cmp.summaryCopy}</Markdown>
          </section>
        ) : null}

        <section className="mt-10 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-700"></th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">{a.name}</th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">{b.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="px-4 py-2 font-medium text-slate-700">{r.label}</td>
                  <td className="px-4 py-2 text-slate-700">{r.a}</td>
                  <td className="px-4 py-2 text-slate-700">{r.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <ProsConsBlock vendor={a} />
          <ProsConsBlock vendor={b} />
        </section>

        {cmp.verdictCopy ? (
          <section className="mt-10 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Our verdict</h2>
            <Markdown>{cmp.verdictCopy}</Markdown>
          </section>
        ) : null}
      </div>
    </>
  );
}

function ComparisonHeader({ vendor }: { vendor: { slug: string; name: string; tagline: string | null; category: { slug: string }; ourScore: number | null } }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <Link href={`/${vendor.category.slug}/${vendor.slug}`} className="text-xl font-semibold text-slate-900 hover:underline">
        {vendor.name}
      </Link>
      {vendor.tagline ? <p className="mt-1 text-sm text-slate-600">{vendor.tagline}</p> : null}
      <div className="mt-3"><ScorePill score={vendor.ourScore} /></div>
    </div>
  );
}

function ProsConsBlock({ vendor }: { vendor: { name: string; pros: string[]; cons: string[] } }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="mb-3 text-base font-semibold text-slate-900">{vendor.name}</h3>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pros</h4>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {vendor.pros.map((p) => <li key={p}>{p}</li>)}
      </ul>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cons</h4>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
        {vendor.cons.map((c) => <li key={c}>{c}</li>)}
      </ul>
    </div>
  );
}
