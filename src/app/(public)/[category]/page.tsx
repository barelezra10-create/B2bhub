import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { displayRank } from "@/lib/ranking";
import { PageHero } from "../_components/PageHero";
import { VendorCard } from "../_components/VendorCard";
import { FaqList } from "../_components/FaqList";
import { JsonLd, categoryJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/schema-org";

export const revalidate = 3600;

export async function generateStaticParams() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    select: { slug: true },
  });
  return categories.map((c) => ({ category: c.slug }));
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
  const guide = category.buyerGuides[0];

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
        eyebrow="Category"
        title={category.name}
        description={category.description}
      />
      <div className="mx-auto max-w-6xl px-4 py-10">
        {featured.length > 0 ? (
          <section className="mb-10">
            <h2 className="mb-4 text-base font-semibold text-slate-900">Featured partners</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {featured.map((v) => (
                <VendorCard
                  key={v.id}
                  href={`/${category.slug}/${v.slug}`}
                  name={v.name}
                  tagline={v.tagline}
                  ourScore={v.ourScore}
                  sponsored={v.sponsorTier !== "none"}
                />
              ))}
            </div>
          </section>
        ) : null}

        <section className="flex flex-wrap items-end justify-between gap-4 mb-4">
          <h2 className="text-xl font-semibold text-slate-900">All {category.name}</h2>
          <div className="flex gap-3 text-sm">
            <Link href={`/${category.slug}/best`} className="text-slate-700 hover:text-slate-900 underline">
              Top {Math.min(10, sortedVendors.length)}
            </Link>
            {guide ? (
              <Link href={`/${category.slug}/buyers-guide`} className="text-slate-700 hover:text-slate-900 underline">
                Buyer&apos;s guide
              </Link>
            ) : null}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedVendors.map((v) => (
            <VendorCard
              key={v.id}
              href={`/${category.slug}/${v.slug}`}
              name={v.name}
              tagline={v.tagline}
              ourScore={v.ourScore}
              sponsored={v.sponsorTier !== "none"}
            />
          ))}
        </div>

        <FaqList items={faqs} />
      </div>
    </>
  );
}
