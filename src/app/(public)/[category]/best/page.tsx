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
      vendors: {
        where: { status: "published" },
      },
    },
  });
  if (!category) notFound();

  const top = pickTopN(category.vendors, 10);
  const year = new Date().getFullYear();

  return (
    <>
      <JsonLd data={itemListJsonLd({
        name: `Best ${category.name} (${year})`,
        vendors: top.map((v) => ({
          name: v.name,
          slug: v.slug,
          categorySlug: category.slug,
          ourScore: v.ourScore,
        })),
      })} />
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: category.name, url: `/${category.slug}` },
        { name: "Best", url: `/${category.slug}/best` },
      ])} />
      <PageHero
        eyebrow="Top picks"
        title={`Best ${category.name} (${year})`}
        description="Our editorial top picks based on hands-on research, real customer reviews, pricing transparency, and integration breadth."
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
          <strong className="font-semibold">How we picked these.</strong> Editorial scores 1-10 based on
          research and real customer reviews. Sponsored vendors are clearly badged and never appear in
          the top 5 unless they earn a 7+ on their own merits.
        </div>
        <ol className="space-y-6">
          {top.map((v, i) => (
            <li key={v.id}>
              <VendorRankRow
                rank={i + 1}
                href={`/${category.slug}/${v.slug}`}
                name={v.name}
                tagline={v.tagline}
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
            { q: `How do you rank ${category.name.toLowerCase()}?`, a: "Editorial scores from research and real customer reviews. Sponsorship can boost ranking, but vendors must earn a 7+ on their own to appear in the top 5." },
            { q: "When was this list last updated?", a: `Last reviewed ${new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}.` },
          ]}
        />
      </div>
    </>
  );
}
