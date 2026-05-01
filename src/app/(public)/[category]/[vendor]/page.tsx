import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { displayRank } from "@/lib/ranking";
import { Markdown } from "@/lib/markdown";
import { PageHero } from "../../_components/PageHero";
import { ScorePill } from "../../_components/ScorePill";
import { SponsoredBadge } from "../../_components/SponsoredBadge";
import { VendorCard } from "../../_components/VendorCard";
import { VendorLogo } from "../../_components/VendorLogo";
import { FaqList } from "../../_components/FaqList";
import { EditorTake } from "../../_components/EditorTake";
import { EditorMark, SectionBreak } from "../../_components/EditorMark";
import { JsonLd, softwareApplicationJsonLd, breadcrumbJsonLd } from "@/lib/schema-org";

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
  // Skip prerender for vendor + alternatives pages to keep build's DB
  // connection count manageable. ISR (revalidate: 3600) handles caching;
  // first request renders + caches, subsequent hits are fast.
  return [];
}

function parseSegment(segment: string): { vendorSlug: string; isAlternatives: boolean } {
  if (segment.endsWith("-alternatives")) {
    return { vendorSlug: segment.slice(0, -"-alternatives".length), isAlternatives: true };
  }
  return { vendorSlug: segment, isAlternatives: false };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; vendor: string }>;
}): Promise<Metadata> {
  const { category: categorySlug, vendor: rawSegment } = await params;
  const { vendorSlug, isAlternatives } = parseSegment(rawSegment);
  const vendor = await db.vendor.findUnique({
    where: { slug: vendorSlug },
    include: { category: true },
  });
  if (!vendor || vendor.category.slug !== categorySlug) return {};
  if (isAlternatives) {
    return {
      title: `${vendor.name} alternatives | The Hub`,
      description: `Looking for an alternative to ${vendor.name}? Compare the top alternatives in ${vendor.category.name.toLowerCase()}.`,
    };
  }
  return {
    title: `${vendor.name} review (${new Date().getFullYear()}) | The Hub`,
    description:
      vendor.descriptionShort ?? vendor.tagline ?? `${vendor.name} review and pricing.`,
  };
}

export default async function VendorPage({
  params,
}: {
  params: Promise<{ category: string; vendor: string }>;
}) {
  const { category: categorySlug, vendor: rawSegment } = await params;
  const { vendorSlug, isAlternatives } = parseSegment(rawSegment);

  const vendor = await db.vendor.findUnique({
    where: { slug: vendorSlug },
    include: { category: true },
  });
  if (!vendor) notFound();
  if (vendor.category.slug !== categorySlug) notFound();
  if (vendor.status !== "published") notFound();

  const competitors = await db.vendor.findMany({
    where: {
      categoryId: vendor.categoryId,
      status: "published",
      slug: { not: vendor.slug },
    },
  });
  const sortedCompetitors = [...competitors].sort((a, b) => displayRank(b) - displayRank(a));

  const comparisonsForVendor = await db.comparison.findMany({
    where: {
      isPublished: true,
      OR: [{ vendorAId: vendor.id }, { vendorBId: vendor.id }],
    },
    include: { vendorA: true, vendorB: true },
    take: 6,
  });

  if (isAlternatives) {
    const alternatives = sortedCompetitors.slice(0, 8);
    const lastReviewed = new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
    return (
      <>
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Home", url: "/" },
            { name: vendor.category.name, url: `/${vendor.category.slug}` },
            { name: vendor.name, url: `/${vendor.category.slug}/${vendor.slug}` },
            {
              name: "Alternatives",
              url: `/${vendor.category.slug}/${vendor.slug}-alternatives`,
            },
          ])}
        />
        <PageHero
          variant="ultra"
          eyebrow={`${vendor.category.name} · Alternatives report`}
          title={
            <>
              The best{" "}
              <span
                className="italic text-[var(--accent)]"
                style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}
              >
                {vendor.name}
              </span>{" "}
              alternatives
            </>
          }
          description={`Looking for something different than ${vendor.name}? Here are the top ${alternatives.length} ${vendor.category.name.toLowerCase()} we'd consider, ranked by editorial score.`}
          meta={
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[var(--border)] pt-6 text-sm text-[var(--fg-muted)]">
              <span className="font-mono text-[11px] uppercase tracking-[0.22em]">
                Last reviewed{" "}
                <span className="text-[var(--fg)]">{lastReviewed}</span>
              </span>
              <Link
                href={`/${vendor.category.slug}/${vendor.slug}`}
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent)] link-underline"
              >
                ← Back to {vendor.name}
              </Link>
            </div>
          }
        />

        <div className="mx-auto max-w-4xl px-6 py-14">
          <ol className="space-y-5">
            {alternatives.map((alt, i) => (
              <li key={alt.id}>
                <Link
                  href={`/${vendor.category.slug}/${alt.slug}`}
                  className="group grid items-start gap-5 border border-[var(--border)] bg-[var(--bg)] p-6 card glow-spotlight rounded-xl md:grid-cols-[80px_1fr_auto]"
                >
                  <span
                    className="font-display text-5xl font-semibold leading-none text-[var(--accent)]"
                    style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
                  >
                    {(i + 1).toString().padStart(2, "0")}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <VendorLogo vendor={alt} size={40} rounded="md" />
                      <h3 className="font-display text-xl font-semibold leading-tight text-[var(--fg)] group-hover:text-[var(--accent)]">
                        {alt.name}
                      </h3>
                      {alt.sponsorTier !== "none" ? <SponsoredBadge subtle /> : null}
                    </div>
                    {alt.tagline ? (
                      <p className="mt-2 text-[14px] leading-relaxed text-[var(--fg-muted)]">
                        {alt.tagline}
                      </p>
                    ) : null}
                    <p className="mt-3 text-[13px] text-[var(--fg-soft)]">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
                        Choose if{" "}
                      </span>
                      you want a{" "}
                      {alt.bestForSegment === vendor.bestForSegment
                        ? "drop-in alternative"
                        : `${SEGMENT_LABELS[alt.bestForSegment] ?? alt.bestForSegment}-leaning option`}
                      {alt.pricingStartingAt
                        ? ` starting at ${alt.pricingStartingAt}`
                        : ""}
                      .
                    </p>
                  </div>
                  <ScorePill score={alt.ourScore} size="md" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </>
    );
  }

  // Profile view
  const closestCompetitors = sortedCompetitors.slice(0, 4);
  const lastReviewed = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const faqs = [
    {
      q: `What is ${vendor.name}?`,
      a:
        vendor.descriptionShort ??
        `${vendor.name} is a ${vendor.category.name.toLowerCase()} platform.`,
    },
    {
      q: `How much does ${vendor.name} cost?`,
      a: vendor.pricingStartingAt
        ? `${vendor.name} starts at ${vendor.pricingStartingAt}. Custom plans are available; contact the vendor for a quote.`
        : `${vendor.name} pricing is custom; contact the vendor for a quote.`,
    },
    {
      q: `Who is ${vendor.name} best for?`,
      a: `Best fit for ${SEGMENT_LABELS[vendor.bestForSegment] ?? vendor.bestForSegment} buyers in the ${vendor.category.name.toLowerCase()} space.`,
    },
    {
      q: `What are the alternatives to ${vendor.name}?`,
      a: `The closest alternatives in ${vendor.category.name.toLowerCase()} include ${sortedCompetitors.slice(0, 3).map((c) => c.name).join(", ")}. See the full list on our alternatives page.`,
    },
  ];

  return (
    <>
      <JsonLd data={softwareApplicationJsonLd(vendor)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: vendor.category.name, url: `/${vendor.category.slug}` },
          { name: vendor.name, url: `/${vendor.category.slug}/${vendor.slug}` },
        ])}
      />

      {/* Custom hero with logo + score */}
      <section className="border-b border-[var(--border)] bg-[var(--bg)] grid-overlay">
        <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-[1fr_auto] md:py-20">
          <div className="min-w-0">
            <p className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--accent)]">
              <span className="inline-block h-px w-8 bg-[var(--accent)]" aria-hidden />
              <Link href={`/${vendor.category.slug}`} className="hover:text-[var(--fg)]">
                {vendor.category.name}
              </Link>
              <span aria-hidden>·</span>
              <span>Editorial review</span>
            </p>
            <div className="flex items-start gap-5">
              <VendorLogo vendor={vendor} size={88} rounded="md" />
              <div className="min-w-0">
                <h1
                  className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-[var(--fg)] md:text-6xl fade-rise"
                  style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 50" }}
                >
                  {vendor.name}
                </h1>
                {vendor.tagline ? (
                  <p
                    className="mt-3 max-w-2xl text-lg leading-relaxed text-[var(--fg-soft)] fade-rise"
                    style={{ animationDelay: "120ms" }}
                  >
                    {vendor.tagline}
                  </p>
                ) : null}
                <div className="mt-5 flex flex-wrap items-center gap-4">
                  {vendor.sponsorTier !== "none" ? <SponsoredBadge /> : null}
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
                    Last reviewed {lastReviewed}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Score + CTA panel */}
          <div className="flex flex-col items-start gap-4 md:items-end">
            <ScorePill score={vendor.ourScore} size="lg" />
            <a
              href={vendor.websiteUrl}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="inline-flex items-center gap-2 bg-[var(--accent)] px-5 py-3 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--bg)] hover:bg-[var(--accent-deep)]"
            >
              Visit {vendor.name}
              <span aria-hidden>↗</span>
            </a>
            <Link
              href={`/${vendor.category.slug}/${vendor.slug}-alternatives`}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent)] link-underline"
            >
              See {Math.min(8, sortedCompetitors.length)} alternatives →
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 md:grid-cols-[minmax(0,1fr)_280px]">
        {/* Main column */}
        <article className="min-w-0">
          {/* At-a-glance */}
          <section>
            <header className="mb-4 flex items-baseline gap-3">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--fg)]">
                At a glance
              </h2>
              <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
            </header>
            <dl className="grid grid-cols-2 gap-px bg-[var(--border)] md:grid-cols-4">
              <Cell label="Pricing">
                {vendor.pricingStartingAt ?? PRICING_LABELS[vendor.pricingModel] ?? vendor.pricingModel}
              </Cell>
              <Cell label="Best for">
                {SEGMENT_LABELS[vendor.bestForSegment] ?? vendor.bestForSegment}
              </Cell>
              <Cell label="Founded">{vendor.foundedYear ?? "-"}</Cell>
              <Cell label="HQ">{vendor.hqLocation ?? "-"}</Cell>
            </dl>
          </section>

          {/* Editor's take callout */}
          {vendor.descriptionShort ? (
            <section className="mt-12">
              <EditorTake
                verdict={vendor.descriptionShort}
                bestFor={
                  vendor.bestForSegment === "all"
                    ? "Teams of any size in this category"
                    : `${SEGMENT_LABELS[vendor.bestForSegment] ?? vendor.bestForSegment} teams`
                }
                skipIf={vendor.cons[0] ?? undefined}
                signature="The Hub Editorial"
              />
            </section>
          ) : null}

          {/* Long description */}
          {vendor.descriptionLong ? (
            <section className="mt-12">
              <header className="mb-6 flex items-baseline gap-3">
                <h2 className="font-display text-3xl font-semibold tracking-tight text-[var(--fg)]">
                  Our review
                </h2>
                <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
              </header>
              <div className="dropcap">
                <Markdown>{vendor.descriptionLong}</Markdown>
              </div>
              <div className="mt-6 flex justify-center text-[var(--accent)]">
                <EditorMark size={14} />
              </div>
            </section>
          ) : null}

          {/* Pros / Cons */}
          {vendor.pros.length > 0 || vendor.cons.length > 0 ? (
            <section className="mt-12">
              <header className="mb-4 flex items-baseline gap-3">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--fg)]">
                  The honest scorecard
                </h2>
                <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
              </header>
              <div className="grid gap-6 md:grid-cols-2">
                <div className="border border-[var(--border)] bg-[var(--bg)] p-6">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
                    What works
                  </h3>
                  <ul className="mt-3 space-y-2 text-[15px] text-[var(--fg)]">
                    {vendor.pros.map((p) => (
                      <li key={p} className="flex gap-3">
                        <span className="mt-2 inline-block h-1 w-3 flex-shrink-0 bg-[var(--accent)]" aria-hidden />
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="border border-[var(--border)] bg-[var(--bg)] p-6">
                  <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--danger)]">
                    What gives us pause
                  </h3>
                  <ul className="mt-3 space-y-2 text-[15px] text-[var(--fg)]">
                    {vendor.cons.map((c) => (
                      <li key={c} className="flex gap-3">
                        <span className="mt-2 inline-block h-1 w-3 flex-shrink-0 bg-[var(--danger)]" aria-hidden />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          ) : null}

          {/* Key features */}
          {vendor.keyFeatures.length > 0 ? (
            <section className="mt-12">
              <header className="mb-4 flex items-baseline gap-3">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--fg)]">
                  Key features
                </h2>
                <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
                <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
                  {vendor.keyFeatures.length} listed
                </span>
              </header>
              <ul className="grid grid-cols-1 gap-px bg-[var(--border)] sm:grid-cols-2">
                {vendor.keyFeatures.map((f, i) => (
                  <li
                    key={f}
                    className="flex items-baseline gap-3 bg-[var(--bg)] px-4 py-3 text-sm"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-[var(--fg-subtle)]">
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="text-[var(--fg)]">{f}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {/* Integrations */}
          {vendor.integrations.length > 0 ? (
            <section className="mt-12">
              <header className="mb-4 flex items-baseline gap-3">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--fg)]">
                  Integrations
                </h2>
                <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
              </header>
              <div className="flex flex-wrap gap-2">
                {vendor.integrations.map((i) => (
                  <span
                    key={i}
                    className="border border-[var(--border)] bg-[var(--bg-elev)] px-3 py-1 text-sm text-[var(--fg)]"
                  >
                    {i}
                  </span>
                ))}
              </div>
            </section>
          ) : null}

          {/* How it compares */}
          {closestCompetitors.length > 0 ? (
            <section className="mt-12">
              <header className="mb-4 flex items-end justify-between gap-3">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--fg)]">
                  How {vendor.name} compares
                </h2>
                <Link
                  href={`/${vendor.category.slug}/${vendor.slug}-alternatives`}
                  className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--accent)] link-underline"
                >
                  Top {Math.min(8, sortedCompetitors.length)} alternatives →
                </Link>
              </header>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {closestCompetitors.map((c) => (
                  <VendorCard
                    key={c.id}
                    href={`/${vendor.category.slug}/${c.slug}`}
                    vendor={c}
                    ourScore={c.ourScore}
                    sponsored={c.sponsorTier !== "none"}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {/* Side-by-sides */}
          {comparisonsForVendor.length > 0 ? (
            <section className="mt-12">
              <header className="mb-4 flex items-baseline gap-3">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-[var(--fg)]">
                  Side-by-side
                </h2>
                <span className="h-px flex-1 bg-[var(--border)]" aria-hidden />
              </header>
              <ul className="grid gap-3 sm:grid-cols-2">
                {comparisonsForVendor.map((cmp) => {
                  const other = cmp.vendorAId === vendor.id ? cmp.vendorB : cmp.vendorA;
                  return (
                    <li key={cmp.id}>
                      <Link
                        href={`/compare/${cmp.slug}`}
                        className="group flex items-center justify-between gap-3 border border-[var(--border)] bg-[var(--bg)] px-4 py-3 card glow-spotlight rounded-xl"
                      >
                        <span className="flex items-center gap-3">
                          <VendorLogo vendor={vendor} size={28} rounded="md" />
                          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-subtle)]">
                            vs
                          </span>
                          <VendorLogo vendor={other} size={28} rounded="md" />
                          <span className="font-display text-sm font-semibold text-[var(--fg)]">
                            {other.name}
                          </span>
                        </span>
                        <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)] opacity-0 transition-opacity group-hover:opacity-100">
                          Read →
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ) : null}

          <FaqList items={faqs} />

          {/* End mark */}
          <div className="mt-16 flex flex-col items-center gap-3 text-[var(--accent)]">
            <EditorMark size={16} />
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-subtle)]">
              End of review
            </span>
          </div>
        </article>

        {/* Sidebar */}
        <aside className="hidden md:block">
          <div className="sticky top-6 space-y-6">
            <div className="border border-[var(--border)] bg-[var(--bg-elev)] p-5">
              <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
                Editorial verdict
              </h3>
              <p className="mt-3 font-display text-2xl font-semibold leading-tight text-[var(--fg)]">
                {(vendor.ourScore ?? 0) >= 8.5
                  ? "Top-tier pick."
                  : (vendor.ourScore ?? 0) >= 7
                  ? "Solid choice."
                  : "Worth considering, with caveats."}
              </p>
              {vendor.ourScoreNotes ? (
                <p className="mt-3 text-[14px] leading-relaxed text-[var(--fg-soft)]">
                  {vendor.ourScoreNotes}
                </p>
              ) : null}
              <a
                href={vendor.websiteUrl}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-[var(--accent)] px-4 py-2.5 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--bg)] hover:bg-[var(--accent-deep)]"
              >
                Visit {vendor.name} ↗
              </a>
            </div>

            <nav className="border-t border-[var(--border)] pt-6 text-sm">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
                On this page
              </h4>
              <ul className="mt-3 space-y-1.5 text-[var(--fg-soft)]">
                <li><span className="text-[var(--accent)]">·</span> At a glance</li>
                {vendor.descriptionLong ? <li><span className="text-[var(--accent)]">·</span> Our review</li> : null}
                {vendor.pros.length > 0 ? <li><span className="text-[var(--accent)]">·</span> Honest scorecard</li> : null}
                {vendor.keyFeatures.length > 0 ? <li><span className="text-[var(--accent)]">·</span> Key features</li> : null}
                {vendor.integrations.length > 0 ? <li><span className="text-[var(--accent)]">·</span> Integrations</li> : null}
                {closestCompetitors.length > 0 ? <li><span className="text-[var(--accent)]">·</span> How it compares</li> : null}
                <li><span className="text-[var(--accent)]">·</span> FAQ</li>
              </ul>
            </nav>
          </div>
        </aside>
      </div>
    </>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-[var(--bg)] px-4 py-4">
      <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
        {label}
      </dt>
      <dd className="mt-1.5 font-display text-base font-semibold text-[var(--fg)]">
        {children}
      </dd>
    </div>
  );
}
