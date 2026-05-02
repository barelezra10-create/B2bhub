import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { displayRank } from "@/lib/ranking";
import { PageHero } from "../_components/PageHero";
import { VendorRankRow } from "../_components/VendorRankRow";
import { FaqList } from "../_components/FaqList";
import { JsonLd, categoryJsonLd, faqJsonLd, breadcrumbJsonLd, itemListJsonLd } from "@/lib/schema-org";

export const revalidate = 3600;

const SEGMENT_LABELS: Record<string, string> = {
  smb: "SMB",
  mid_market: "Mid-market",
  enterprise: "Enterprise",
  all: "all sizes",
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
  return {
    title: category.seoTitle ?? `Best ${category.name} (${new Date().getFullYear()}) | The Hub`,
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
      vendors: { where: { status: "published" } },
      buyerGuides: {
        where: { isPublished: true },
        select: { slug: true, title: true },
      },
    },
  });
  if (!category) notFound();

  const sortedVendors = [...category.vendors].sort((a, b) => displayRank(b) - displayRank(a));
  const guide = category.buyerGuides[0];
  const lastReviewed = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const avgScore = sortedVendors.length
    ? sortedVendors.reduce((sum, v) => sum + (v.ourScore ?? 0), 0) /
      Math.max(1, sortedVendors.filter((v) => v.ourScore !== null).length)
    : 0;

  const faqs = [
    {
      q: `What is ${category.name.toLowerCase()}?`,
      a: category.description,
    },
    {
      q: `How did you rank these ${category.name.toLowerCase()}?`,
      a: "Editorial scores 1-10 based on hands-on research, real customer reviews, pricing transparency, integration breadth, and ease of use. Sponsored vendors are clearly badged and never reach the top of the list without earning it.",
    },
    {
      q: `How many ${category.name.toLowerCase()} did you review?`,
      a: `We track ${sortedVendors.length} ${category.name.toLowerCase()} vendors and refresh scores quarterly.`,
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
      <JsonLd
        data={itemListJsonLd({
          name: `Best ${category.name} (${new Date().getFullYear()})`,
          vendors: sortedVendors.slice(0, 10).map((v) => ({
            name: v.name,
            slug: v.slug,
            categorySlug: category.slug,
            ourScore: v.ourScore,
          })),
        })}
      />

      <PageHero
        variant="ultra"
        eyebrow={`The ${new Date().getFullYear()} ranking · ${category.name}`}
        title={
          <>
            Best <span className="text-gradient">{category.name.toLowerCase()}</span>.
          </>
        }
        description={category.description.split("\n\n")[0]}
        meta={
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[var(--border)] pt-6 text-sm text-[var(--fg-muted)]">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] font-semibold">
              {sortedVendors.length} reviewed
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] font-semibold">
              Avg score{" "}
              <span className="text-[var(--accent)] font-bold">{avgScore.toFixed(1)}</span>
            </span>
            <span className="font-mono text-[11px] uppercase tracking-[0.22em] font-semibold">
              Last reviewed{" "}
              <span className="text-[var(--fg)]">{lastReviewed}</span>
            </span>
            {guide ? (
              <Link
                href={`/${category.slug}/buyers-guide`}
                className="font-mono text-[11px] uppercase tracking-[0.22em] font-semibold text-[var(--accent)] link-underline"
              >
                Buyer&apos;s guide →
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="container-x py-14">
        {/* Long-form category intro */}
        <section className="mb-12 max-w-3xl">
          <h2 className="font-display text-2xl font-bold tracking-tight text-[var(--fg)] md:text-3xl">
            About {category.name.toLowerCase()}
          </h2>
          <div className="mt-4 space-y-4 text-[16px] leading-relaxed text-[var(--fg-soft)]">
            {category.description.split("\n\n").map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
          {guide ? (
            <Link
              href={`/${category.slug}/buyers-guide`}
              className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent)] link-underline"
            >
              Read the full {category.name.toLowerCase()} buyer&apos;s guide →
            </Link>
          ) : null}
        </section>

        {/* Methodology callout */}
        <aside className="mb-10 grid gap-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-elev)] p-6 md:grid-cols-[140px_1fr]">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--accent-deep)]">
            How we ranked
          </p>
          <p className="text-[14px] leading-relaxed text-[var(--fg-soft)]">
            <strong className="font-display font-semibold text-[var(--fg)]">Editorial scores 1-10</strong>{" "}
            based on hands-on research, real customer reviews, pricing transparency, integration
            breadth, and ease of use. Sponsored vendors are clearly badged and must earn a{" "}
            <span className="font-mono">7.0+</span> on their own merits to appear in the top five.
          </p>
        </aside>

        {/* THE RANKED LIST */}
        <ol className="space-y-6">
          {sortedVendors.map((v, i) => (
            <li key={v.id}>
              <VendorRankRow
                rank={i + 1}
                href={`/${category.slug}/${v.slug}`}
                vendor={v}
                pros={v.pros}
                cons={v.cons}
                bestForLabel={SEGMENT_LABELS[v.bestForSegment] ?? v.bestForSegment}
                sponsored={v.sponsorTier !== "none"}
              />
            </li>
          ))}
        </ol>

        <FaqList items={faqs} />
      </div>
    </>
  );
}
