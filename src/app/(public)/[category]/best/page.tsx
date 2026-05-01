import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { pickTopN } from "@/lib/ranking";
import { PageHero } from "../../_components/PageHero";
import { VendorRankRow } from "../../_components/VendorRankRow";
import { FaqList } from "../../_components/FaqList";
import { JsonLd, itemListJsonLd, breadcrumbJsonLd } from "@/lib/schema-org";

export const revalidate = 3600;

const SEGMENT_LABELS: Record<string, string> = {
  smb: "SMB",
  mid_market: "Mid-market",
  enterprise: "Enterprise",
  all: "All sizes",
};

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
  const year = new Date().getFullYear();
  return {
    title: `Best ${category.name} (${year}) | The Hub`,
    description: `Top ${category.name.toLowerCase()} for ${year}. Editorial scores, real pros and cons, and side-by-side comparisons.`,
  };
}

export default async function TopNPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = await db.category.findUnique({
    where: { slug, isActive: true },
    include: {
      vendors: { where: { status: "published" } },
      buyerGuides: { where: { isPublished: true }, select: { slug: true } },
    },
  });
  if (!category) notFound();

  const top = pickTopN(category.vendors, 10);
  const year = new Date().getFullYear();
  const lastReviewed = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const guide = category.buyerGuides[0];

  return (
    <>
      <JsonLd
        data={itemListJsonLd({
          name: `Best ${category.name} (${year})`,
          vendors: top.map((v) => ({
            name: v.name,
            slug: v.slug,
            categorySlug: category.slug,
            ourScore: v.ourScore,
          })),
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: category.name, url: `/${category.slug}` },
          { name: "Best", url: `/${category.slug}/best` },
        ])}
      />

      <PageHero
        variant="ultra"
        eyebrow={`The ${year} ranking · ${category.name}`}
        title={`Best ${category.name.toLowerCase()}`}
        description="Our editorial top picks. Hands-on research, real customer reviews, pricing transparency, and integration breadth - weighted by what actually matters when buying software at this scale."
        meta={
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[var(--color-rule)] pt-6 text-sm text-[var(--color-ink-muted)]">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em]">
              Last reviewed{" "}
              <span className="text-[var(--color-ink)]">{lastReviewed}</span>
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em]">
              Tracking{" "}
              <span className="text-[var(--color-ink)]">{category.vendors.length}</span> vendors
            </span>
            <Link
              href={`/${category.slug}`}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-forest)] link-underline"
            >
              ← Back to {category.name.toLowerCase()}
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

      <div className="mx-auto max-w-4xl px-6 py-14">
        {/* Methodology */}
        <aside className="mb-12 grid gap-6 border border-[var(--color-rule)] bg-[var(--color-cream-soft)] p-6 md:grid-cols-[120px_1fr]">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-forest)]">
            How we ranked
          </p>
          <p className="text-[15px] leading-relaxed text-[var(--color-ink-soft)]">
            <strong className="font-display font-semibold text-[var(--color-ink)]">Editorial scores 1-10</strong>{" "}
            based on hands-on research and real customer reviews. Sponsored vendors are clearly
            badged and must earn a <span className="font-mono">7.0+</span> on their own merits to
            appear anywhere in the top five.
          </p>
        </aside>

        {/* The list */}
        <ol className="space-y-6">
          {top.map((v, i) => (
            <li key={v.id}>
              <VendorRankRow
                rank={i + 1}
                href={`/${category.slug}/${v.slug}`}
                vendor={v}
                ourScore={v.ourScore}
                pricingStartingAt={v.pricingStartingAt}
                pros={v.pros}
                cons={v.cons}
                bestForLabel={SEGMENT_LABELS[v.bestForSegment] ?? v.bestForSegment}
                sponsored={v.sponsorTier !== "none"}
              />
            </li>
          ))}
        </ol>

        <FaqList
          items={[
            {
              q: `How do you rank ${category.name.toLowerCase()}?`,
              a: "Editorial scores from research and real customer reviews. Sponsorship can boost a vendor's rank, but vendors must earn a 7+ on their own to appear in the top 5. We disclose every sponsored placement.",
            },
            {
              q: "When was this list last updated?",
              a: `Last reviewed ${lastReviewed}. We refresh scores quarterly.`,
            },
          ]}
        />
      </div>
    </>
  );
}
