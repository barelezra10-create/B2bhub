import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Markdown } from "@/lib/markdown";
import { PageHero } from "../../_components/PageHero";
import { ScorePill } from "../../_components/ScorePill";
import { VendorLogo } from "../../_components/VendorLogo";
import { JsonLd, breadcrumbJsonLd } from "@/lib/schema-org";

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
  try {
    const comparisons = await db.comparison.findMany({
      where: { isPublished: true },
      select: { slug: true },
    });
    return comparisons.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
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
    title: `${cmp.vendorA.name} vs ${cmp.vendorB.name} (${new Date().getFullYear()}) | The Hub`,
    description:
      cmp.summaryCopy?.slice(0, 160) ??
      `Side-by-side comparison of ${cmp.vendorA.name} and ${cmp.vendorB.name}. Pricing, features, scores, and the editorial verdict.`,
  };
}

type Side = "a" | "b" | "tie";

type FacetRow = {
  label: string;
  aValue: React.ReactNode;
  bValue: React.ReactNode;
  winner: Side;
};

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

  // Heuristic "where each wins"
  function pricingRank(v: { pricingModel: string; pricingStartingAt: string | null }) {
    if (v.pricingModel === "free") return 0;
    if (v.pricingModel === "freemium") return 1;
    if (v.pricingModel === "paid") return 2;
    return 3; // quote
  }
  const facetRows: FacetRow[] = [
    {
      label: "Editorial score",
      aValue: <ScorePill score={a.ourScore} size="sm" />,
      bValue: <ScorePill score={b.ourScore} size="sm" />,
      winner:
        (a.ourScore ?? 0) > (b.ourScore ?? 0)
          ? "a"
          : (b.ourScore ?? 0) > (a.ourScore ?? 0)
          ? "b"
          : "tie",
    },
    {
      label: "Starting price",
      aValue: a.pricingStartingAt ?? PRICING_LABELS[a.pricingModel] ?? a.pricingModel,
      bValue: b.pricingStartingAt ?? PRICING_LABELS[b.pricingModel] ?? b.pricingModel,
      winner:
        pricingRank(a) < pricingRank(b)
          ? "a"
          : pricingRank(b) < pricingRank(a)
          ? "b"
          : "tie",
    },
    {
      label: "Best for",
      aValue: SEGMENT_LABELS[a.bestForSegment] ?? a.bestForSegment,
      bValue: SEGMENT_LABELS[b.bestForSegment] ?? b.bestForSegment,
      winner: "tie",
    },
    {
      label: "Key features",
      aValue: `${a.keyFeatures.length} listed`,
      bValue: `${b.keyFeatures.length} listed`,
      winner:
        a.keyFeatures.length > b.keyFeatures.length
          ? "a"
          : b.keyFeatures.length > a.keyFeatures.length
          ? "b"
          : "tie",
    },
    {
      label: "Integrations",
      aValue: `${a.integrations.length} listed`,
      bValue: `${b.integrations.length} listed`,
      winner:
        a.integrations.length > b.integrations.length
          ? "a"
          : b.integrations.length > a.integrations.length
          ? "b"
          : "tie",
    },
    {
      label: "HQ",
      aValue: a.hqLocation ?? "-",
      bValue: b.hqLocation ?? "-",
      winner: "tie",
    },
    {
      label: "Founded",
      aValue: a.foundedYear ?? "-",
      bValue: b.foundedYear ?? "-",
      winner: "tie",
    },
  ];

  const aWins = facetRows.filter((r) => r.winner === "a").length;
  const bWins = facetRows.filter((r) => r.winner === "b").length;

  // Related comparisons
  const related = await db.comparison.findMany({
    where: {
      isPublished: true,
      slug: { not: cmp.slug },
      OR: [
        { vendorAId: a.id },
        { vendorBId: a.id },
        { vendorAId: b.id },
        { vendorBId: b.id },
      ],
    },
    include: { vendorA: true, vendorB: true },
    take: 6,
    orderBy: { updatedAt: "desc" },
  });

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: "Compare", url: "/compare" },
          { name: `${a.name} vs ${b.name}`, url: `/compare/${cmp.slug}` },
        ])}
      />

      {/* Hero - dark with mint accents */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg)]">
        <div className="absolute inset-0 glow-radial" aria-hidden />
        <div className="absolute inset-0 grid-overlay opacity-50" aria-hidden />
        <div className="relative container-x py-20 md:py-28">
          <p className="eyebrow mb-8">
            Side-by-side · {a.category.name} · {new Date().getFullYear()}
          </p>

          <div className="grid items-center gap-8 md:grid-cols-[1fr_auto_1fr]">
            <Link
              href={`/${a.category.slug}/${a.slug}`}
              className="group flex flex-col items-start gap-5 md:items-end"
            >
              <div className="flex items-center gap-4 md:flex-row-reverse">
                <VendorLogo vendor={a} size={88} rounded="md" />
                <ScorePill score={a.ourScore} size="lg" />
              </div>
              <div className="md:text-right">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
                  Contender A
                </p>
                <h2 className="mt-2 font-display text-4xl font-bold leading-[0.95] tracking-tight text-[var(--fg)] group-hover:text-[var(--accent)] md:text-6xl">
                  {a.name}
                </h2>
              </div>
            </Link>

            <div className="flex flex-col items-center justify-center">
              <span className="font-display text-3xl italic font-bold text-gradient md:text-4xl">
                versus
              </span>
              <span className="mt-3 h-16 w-px bg-[var(--accent)] opacity-40" aria-hidden />
            </div>

            <Link
              href={`/${b.category.slug}/${b.slug}`}
              className="group flex flex-col items-start gap-5"
            >
              <div className="flex items-center gap-4">
                <VendorLogo vendor={b} size={88} rounded="md" />
                <ScorePill score={b.ourScore} size="lg" />
              </div>
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
                  Contender B
                </p>
                <h2 className="mt-2 font-display text-4xl font-bold leading-[0.95] tracking-tight text-[var(--fg)] group-hover:text-[var(--accent)] md:text-6xl">
                  {b.name}
                </h2>
              </div>
            </Link>
          </div>

          {cmp.hookCopy ? (
            <p className="mt-10 max-w-3xl text-lg leading-relaxed text-[var(--fg-soft)]">
              {cmp.hookCopy}
            </p>
          ) : null}
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-6 py-14">
        {/* The verdict at-a-glance */}
        <section>
          <header className="mb-5 flex items-baseline gap-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--fg)]">
              At a glance
            </h2>
            <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
              {a.name} {aWins} · {b.name} {bWins}
            </span>
          </header>
          <div className="border border-[var(--border)] bg-[var(--bg)]">
            {facetRows.map((r, i) => (
              <div
                key={r.label}
                className={`grid grid-cols-[120px_1fr_1fr] items-center gap-4 px-5 py-3 ${i > 0 ? "border-t border-[var(--border-soft)]" : ""}`}
              >
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
                  {r.label}
                </span>
                <span
                  className={`flex items-center gap-2 text-[15px] ${r.winner === "a" ? "text-[var(--fg)] font-semibold" : "text-[var(--fg-muted)]"}`}
                >
                  {r.winner === "a" ? (
                    <span className="inline-block h-1.5 w-3 bg-[var(--accent)]" aria-hidden />
                  ) : (
                    <span className="inline-block h-1.5 w-3" aria-hidden />
                  )}
                  {r.aValue}
                </span>
                <span
                  className={`flex items-center gap-2 text-[15px] ${r.winner === "b" ? "text-[var(--fg)] font-semibold" : "text-[var(--fg-muted)]"}`}
                >
                  {r.winner === "b" ? (
                    <span className="inline-block h-1.5 w-3 bg-[var(--accent)]" aria-hidden />
                  ) : (
                    <span className="inline-block h-1.5 w-3" aria-hidden />
                  )}
                  {r.bValue}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Where each wins (list view per Bar's request) */}
        <section className="mt-12">
          <header className="mb-5 flex items-baseline gap-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--fg)]">
              Where each one wins
            </h2>
            <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
          </header>
          <div className="grid gap-px bg-[var(--border)] md:grid-cols-2">
            <WinsBlock vendor={a} winsCount={aWins} reasons={facetRows.filter((r) => r.winner === "a").map((r) => r.label)} pros={a.pros} />
            <WinsBlock vendor={b} winsCount={bWins} reasons={facetRows.filter((r) => r.winner === "b").map((r) => r.label)} pros={b.pros} />
          </div>
        </section>

        {/* Choose if blocks */}
        <section className="mt-12">
          <header className="mb-5 flex items-baseline gap-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--fg)]">
              How to choose
            </h2>
            <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
          </header>
          <div className="grid gap-5 md:grid-cols-2">
            <ChooseBlock
              label={`Choose ${a.name} if`}
              vendor={a}
              points={[
                a.bestForSegment !== "all"
                  ? `you're ${SEGMENT_LABELS[a.bestForSegment].toLowerCase()}-sized`
                  : `you want a ${a.category.name.toLowerCase()} that fits any size`,
                a.pricingStartingAt
                  ? `you're comfortable starting at ${a.pricingStartingAt}`
                  : `your team is fine with quote-based pricing`,
                ...a.pros.slice(0, 2).map((p) => p.toLowerCase()),
              ]}
            />
            <ChooseBlock
              label={`Choose ${b.name} if`}
              vendor={b}
              points={[
                b.bestForSegment !== "all"
                  ? `you're ${SEGMENT_LABELS[b.bestForSegment].toLowerCase()}-sized`
                  : `you want a ${b.category.name.toLowerCase()} that fits any size`,
                b.pricingStartingAt
                  ? `you're comfortable starting at ${b.pricingStartingAt}`
                  : `your team is fine with quote-based pricing`,
                ...b.pros.slice(0, 2).map((p) => p.toLowerCase()),
              ]}
            />
          </div>
        </section>

        {/* Editorial summary */}
        {cmp.summaryCopy ? (
          <section className="mt-12 border border-[var(--border)] bg-[var(--bg-elev)] p-8">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
              Quick verdict
            </p>
            <div className="mt-4 dropcap">
              <Markdown>{cmp.summaryCopy}</Markdown>
            </div>
          </section>
        ) : null}

        {/* Pros / cons side by side */}
        <section className="mt-12">
          <header className="mb-5 flex items-baseline gap-3">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--fg)]">
              The full pros & cons
            </h2>
            <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
          </header>
          <div className="grid gap-5 md:grid-cols-2">
            <ProsConsBlock vendor={a} />
            <ProsConsBlock vendor={b} />
          </div>
        </section>

        {/* Verdict copy */}
        {cmp.verdictCopy ? (
          <section className="mt-12 border-t border-b border-[var(--border)] py-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
              Our verdict
            </p>
            <div className="mt-4 max-w-3xl">
              <Markdown>{cmp.verdictCopy}</Markdown>
            </div>
          </section>
        ) : null}

        {/* Related */}
        {related.length > 0 ? (
          <section className="mt-12">
            <header className="mb-5 flex items-baseline gap-3">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--fg)]">
                Related comparisons
              </h2>
              <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
            </header>
            <ul className="grid gap-3 sm:grid-cols-2">
              {related.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/compare/${c.slug}`}
                    className="group flex items-center justify-between gap-3 border border-[var(--border)] bg-[var(--bg)] px-5 py-4 card glow-spotlight rounded-xl"
                  >
                    <span className="flex items-center gap-3">
                      <VendorLogo vendor={c.vendorA} size={28} rounded="md" />
                      <span className="font-display text-sm font-semibold text-[var(--fg)]">
                        {c.vendorA.name}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-subtle)]">
                        vs
                      </span>
                      <span className="font-display text-sm font-semibold text-[var(--fg)]">
                        {c.vendorB.name}
                      </span>
                      <VendorLogo vendor={c.vendorB} size={28} rounded="md" />
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100">
                      Read →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}

function WinsBlock({
  vendor,
  winsCount,
  reasons,
  pros,
}: {
  vendor: { name: string; websiteUrl: string; logoUrl?: string | null };
  winsCount: number;
  reasons: string[];
  pros: string[];
}) {
  return (
    <div className="bg-[var(--bg)] p-6">
      <div className="flex items-center gap-3">
        <VendorLogo vendor={vendor} size={36} rounded="md" />
        <div>
          <h3 className="font-display text-xl font-semibold leading-tight text-[var(--fg)]">
            {vendor.name}
          </h3>
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
            Wins {winsCount} of 7 facets
          </p>
        </div>
      </div>
      {reasons.length > 0 ? (
        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
            Wins on
          </p>
          <ul className="mt-2 flex flex-wrap gap-1.5">
            {reasons.map((r) => (
              <li
                key={r}
                className="border border-[var(--accent)] px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]"
              >
                {r}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--fg-subtle)]">
          No facet wins, but strong on:
        </p>
      )}
      {pros.length > 0 ? (
        <ul className="mt-4 space-y-2 text-[14px] text-[var(--fg)]">
          {pros.slice(0, 3).map((p) => (
            <li key={p} className="flex gap-3">
              <span className="mt-2 inline-block h-1 w-3 flex-shrink-0 bg-[var(--accent)]" aria-hidden />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ChooseBlock({
  label,
  vendor,
  points,
}: {
  label: string;
  vendor: { slug: string; name: string; websiteUrl: string; logoUrl?: string | null; category: { slug: string } };
  points: string[];
}) {
  return (
    <div className="border border-[var(--border)] bg-[var(--bg)] p-6">
      <div className="flex items-center gap-3">
        <VendorLogo vendor={vendor} size={36} rounded="md" />
        <h3 className="font-display text-xl font-semibold tracking-tight text-[var(--fg)]">
          {label}
        </h3>
      </div>
      <ul className="mt-4 space-y-2 text-[15px] text-[var(--fg)]">
        {points.map((p, i) => (
          <li key={`${i}-${p}`} className="flex gap-3">
            <span className="mt-1 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center bg-[var(--accent)] font-mono text-[10px] font-semibold text-[var(--bg)]">
              {(i + 1).toString().padStart(2, "0")}
            </span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <Link
        href={`/${vendor.category.slug}/${vendor.slug}`}
        className="mt-5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent)] link-underline"
      >
        Read full {vendor.name} review →
      </Link>
    </div>
  );
}

function ProsConsBlock({ vendor }: { vendor: { name: string; pros: string[]; cons: string[] } }) {
  return (
    <div className="border border-[var(--border)] bg-[var(--bg)] p-6">
      <h3 className="mb-4 font-display text-lg font-semibold leading-tight text-[var(--fg)]">
        {vendor.name}
      </h3>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
        Pros
      </p>
      <ul className="mb-5 mt-2 space-y-2 text-[14px] text-[var(--fg)]">
        {vendor.pros.map((p) => (
          <li key={p} className="flex gap-3">
            <span className="mt-2 inline-block h-1 w-3 flex-shrink-0 bg-[var(--accent)]" aria-hidden />
            <span>{p}</span>
          </li>
        ))}
      </ul>
      <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--danger)]">
        Cons
      </p>
      <ul className="mt-2 space-y-2 text-[14px] text-[var(--fg)]">
        {vendor.cons.map((c) => (
          <li key={c} className="flex gap-3">
            <span className="mt-2 inline-block h-1 w-3 flex-shrink-0 bg-[var(--danger)]" aria-hidden />
            <span>{c}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
