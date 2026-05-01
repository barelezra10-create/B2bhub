import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { displayRank } from "@/lib/ranking";
import { PageHero } from "../_components/PageHero";
import { VendorCard } from "../_components/VendorCard";
import { VendorLogo } from "../_components/VendorLogo";
import { ScorePill } from "../_components/ScorePill";
import { SponsoredBadge } from "../_components/SponsoredBadge";
import { FaqList } from "../_components/FaqList";
import { JsonLd, categoryJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/schema-org";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const categories = await db.category.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    return categories.map((c) => ({ category: c.slug }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) return {};
  return {
    title: category.seoTitle ?? `${category.name} | The Hub`,
    description: category.seoDescription ?? category.description.slice(0, 160),
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = await db.category.findUnique({
    where: { slug, isActive: true },
    include: {
      vendors: {
        where: { status: "published" },
        orderBy: { name: "asc" },
      },
      buyerGuides: {
        where: { isPublished: true },
        select: { slug: true, title: true },
      },
    },
  });
  if (!category) notFound();

  const sortedVendors = [...category.vendors].sort((a, b) => displayRank(b) - displayRank(a));
  const featured = sortedVendors.filter((v) => v.sponsorTier !== "none").slice(0, 3);
  const top3 = sortedVendors.slice(0, 3);
  const guide = category.buyerGuides[0];

  const avgScore = sortedVendors.length
    ? sortedVendors.reduce((sum, v) => sum + (v.ourScore ?? 0), 0) /
      sortedVendors.filter((v) => v.ourScore !== null).length
    : 0;

  const faqs = [
    {
      q: `What is ${category.name.toLowerCase()}?`,
      a: category.description,
    },
    {
      q: `How many ${category.name.toLowerCase()} vendors do you compare?`,
      a: `We currently track ${sortedVendors.length} ${category.name.toLowerCase()} vendors and update scores quarterly.`,
    },
    {
      q: "How do you score vendors?",
      a: "We score 1-10 based on hands-on research, real customer reviews, pricing transparency, integration breadth, and editorial judgment. Sponsored vendors are clearly badged and never reach the top of a list without earning it.",
    },
  ];

  return (
    <>
      <JsonLd data={categoryJsonLd(category)} />
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: category.name, url: `/${category.slug}` },
      ])} />
      <JsonLd data={faqJsonLd(faqs)} />

      <PageHero
        eyebrow={`Category · ${sortedVendors.length} vendors`}
        title={category.name}
        description={category.description}
        meta={
          <div className="flex flex-wrap items-center gap-x-10 gap-y-4 border-t border-[var(--color-rule)] pt-6">
            <Stat label="Vendors covered" value={sortedVendors.length} />
            {avgScore > 0 ? (
              <Stat label="Avg editorial score" value={avgScore.toFixed(1)} />
            ) : null}
            <Link
              href={`/${category.slug}/best`}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-forest)] link-underline"
            >
              See the top {Math.min(10, sortedVendors.length)} →
            </Link>
            {guide ? (
              <Link
                href={`/${category.slug}/buyers-guide`}
                className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-forest)] link-underline"
              >
                Buyer&apos;s guide →
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="mx-auto max-w-6xl px-6 py-14">
        {/* Top 3 podium */}
        {top3.length > 0 ? (
          <section className="mb-16">
            <header className="mb-6 flex items-end justify-between gap-4 border-b border-[var(--color-rule)] pb-4">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-forest)]">
                  Editor&apos;s shortlist
                </p>
                <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-[var(--color-ink)]">
                  Top 3 in {category.name.toLowerCase()}
                </h2>
              </div>
              <Link
                href={`/${category.slug}/best`}
                className="hidden font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-forest)] link-underline sm:inline-block"
              >
                Full ranking →
              </Link>
            </header>

            <ol className="grid gap-5 md:grid-cols-3">
              {top3.map((v, i) => {
                const rank = i + 1;
                const ribbon =
                  rank === 1 ? "Best overall" : rank === 2 ? "Runner-up" : "Third pick";
                return (
                  <li key={v.id}>
                    <Link
                      href={`/${category.slug}/${v.slug}`}
                      className="group relative flex h-full flex-col border border-[var(--color-rule)] bg-[var(--color-cream)] p-6 card-lift"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className="font-display text-6xl font-semibold leading-none text-[var(--color-forest)]"
                          style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
                        >
                          {rank.toString().padStart(2, "0")}
                        </span>
                        <ScorePill score={v.ourScore} size="md" />
                      </div>
                      <span className="mt-4 inline-flex w-fit items-center border border-[var(--color-gold-deep)] bg-[var(--color-gold-soft)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-gold-deep)]">
                        {ribbon}
                      </span>
                      <div className="mt-5 flex items-center gap-3">
                        <VendorLogo vendor={v} size={44} rounded="md" />
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-xl font-semibold leading-tight text-[var(--color-ink)] group-hover:text-[var(--color-forest)]">
                            {v.name}
                          </h3>
                          {v.sponsorTier !== "none" ? (
                            <SponsoredBadge subtle />
                          ) : null}
                        </div>
                      </div>
                      {v.tagline ? (
                        <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-[var(--color-ink-muted)]">
                          {v.tagline}
                        </p>
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        ) : null}

        {/* Featured row (sponsorships) */}
        {featured.length > 0 ? (
          <section className="mb-16">
            <header className="mb-4 flex items-center gap-3">
              <h3 className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold-deep)]">
                Featured partners
              </h3>
              <span className="h-px flex-1 bg-[var(--color-gold-soft)]" aria-hidden />
            </header>
            <div className="grid gap-5 md:grid-cols-3">
              {featured.map((v) => (
                <VendorCard
                  key={v.id}
                  href={`/${category.slug}/${v.slug}`}
                  vendor={v}
                  ourScore={v.ourScore}
                  sponsored={v.sponsorTier !== "none"}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* All vendors grid */}
        <section>
          <header className="mb-6 flex items-end justify-between gap-4 border-b border-[var(--color-rule)] pb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-forest)]">
                The full directory
              </p>
              <h2 className="mt-2 font-display text-3xl font-semibold leading-tight text-[var(--color-ink)]">
                All {sortedVendors.length} {category.name.toLowerCase()}, ranked
              </h2>
            </div>
          </header>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sortedVendors.map((v) => (
              <VendorCard
                key={v.id}
                href={`/${category.slug}/${v.slug}`}
                vendor={v}
                ourScore={v.ourScore}
                sponsored={v.sponsorTier !== "none"}
              />
            ))}
          </div>
        </section>

        <FaqList items={faqs} />
      </div>
    </>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div>
      <p className="font-display text-2xl font-semibold leading-none text-[var(--color-ink)]">
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
        {label}
      </p>
    </div>
  );
}
