import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { displayRank } from "@/lib/ranking";
import { Markdown } from "@/lib/markdown";
import { PageHero } from "../../_components/PageHero";
import { VendorLogo } from "../../_components/VendorLogo";
import { ScorePill } from "../../_components/ScorePill";
import { JsonLd, articleJsonLd, breadcrumbJsonLd } from "@/lib/schema-org";

export const revalidate = 3600;

export async function generateStaticParams() {
  try {
    const guides = await db.buyerGuide.findMany({
      where: { isPublished: true },
      select: { category: { select: { slug: true } } },
    });
    return guides.map((g) => ({ category: g.category.slug }));
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
  const category = await db.category.findUnique({
    where: { slug },
    include: { buyerGuides: { where: { isPublished: true } } },
  });
  const guide = category?.buyerGuides[0];
  if (!category || !guide) return {};
  return {
    title: `${guide.title} | The Hub`,
    description: `Buyer's guide for ${category.name.toLowerCase()}.`,
  };
}

export default async function BuyerGuidePage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = await db.category.findUnique({
    where: { slug, isActive: true },
    include: {
      buyerGuides: { where: { isPublished: true } },
      vendors: { where: { status: "published" } },
    },
  });
  if (!category) notFound();
  const guide = category.buyerGuides[0];
  if (!guide) notFound();

  const top3 = [...category.vendors]
    .sort((a, b) => displayRank(b) - displayRank(a))
    .slice(0, 3);

  const lastReviewed = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <>
      <JsonLd
        data={articleJsonLd({
          title: guide.title,
          description: `Buyer's guide for ${category.name.toLowerCase()}.`,
          url: `/${category.slug}/buyers-guide`,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: "/" },
          { name: category.name, url: `/${category.slug}` },
          { name: "Buyer's guide", url: `/${category.slug}/buyers-guide` },
        ])}
      />

      <PageHero
        variant="ultra"
        eyebrow={`Buyer's guide · ${category.name}`}
        title={guide.title}
        meta={
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-[var(--color-rule)] pt-6 text-sm text-[var(--color-ink-muted)]">
            <span className="font-mono text-[11px] uppercase tracking-[0.22em]">
              Last reviewed{" "}
              <span className="text-[var(--color-ink)]">{lastReviewed}</span>
            </span>
            <Link
              href={`/${category.slug}`}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-forest)] link-underline"
            >
              ← {category.name}
            </Link>
            <Link
              href={`/${category.slug}/best`}
              className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-forest)] link-underline"
            >
              See the top {Math.min(10, category.vendors.length)} →
            </Link>
          </div>
        }
      />

      <div className="mx-auto grid max-w-6xl gap-12 px-6 py-14 md:grid-cols-[minmax(0,1fr)_280px]">
        {/* Body */}
        <article className="dropcap min-w-0">
          <Markdown>{guide.bodyMarkdown}</Markdown>
        </article>

        {/* Sticky sidebar with editor's picks */}
        <aside className="hidden md:block">
          <div className="sticky top-6">
            <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-forest)]">
              Editor&apos;s shortlist
            </h3>
            <p className="mt-2 font-display text-xl font-semibold leading-tight text-[var(--color-ink)]">
              Our top {top3.length} picks
            </p>
            <ul className="mt-5 space-y-3">
              {top3.map((v, i) => (
                <li key={v.id}>
                  <Link
                    href={`/${category.slug}/${v.slug}`}
                    className="group flex items-start gap-3 border border-[var(--color-rule)] bg-[var(--color-cream)] p-3 card-lift"
                  >
                    <span
                      className="font-display text-2xl font-semibold leading-none text-[var(--color-forest)]"
                      style={{ fontVariationSettings: "'opsz' 144, 'WONK' 1" }}
                    >
                      {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <VendorLogo vendor={v} size={20} rounded="md" />
                        <span className="font-display text-sm font-semibold leading-tight text-[var(--color-ink)] group-hover:text-[var(--color-forest)]">
                          {v.name}
                        </span>
                      </div>
                      <div className="mt-1.5">
                        <ScorePill score={v.ourScore} size="sm" />
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href={`/${category.slug}/best`}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 bg-[var(--color-forest)] px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-cream)] hover:bg-[var(--color-forest-deep)]"
            >
              See full ranking →
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
