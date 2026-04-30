import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Markdown } from "@/lib/markdown";
import { PageHero } from "../../_components/PageHero";
import { JsonLd, articleJsonLd, breadcrumbJsonLd } from "@/lib/schema-org";

export const revalidate = 3600;

export async function generateStaticParams() {
  const guides = await db.buyerGuide.findMany({
    where: { isPublished: true },
    select: { category: { select: { slug: true } } },
  });
  return guides.map((g) => ({ category: g.category.slug }));
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
    },
  });
  if (!category) notFound();
  const guide = category.buyerGuides[0];
  if (!guide) notFound();

  return (
    <>
      <JsonLd data={articleJsonLd({
        title: guide.title,
        description: `Buyer's guide for ${category.name.toLowerCase()}.`,
        url: `/${category.slug}/buyers-guide`,
      })} />
      <JsonLd data={breadcrumbJsonLd([
        { name: "Home", url: "/" },
        { name: category.name, url: `/${category.slug}` },
        { name: "Buyer's guide", url: `/${category.slug}/buyers-guide` },
      ])} />
      <PageHero
        eyebrow={`${category.name} buyer's guide`}
        title={guide.title}
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <Markdown>{guide.bodyMarkdown}</Markdown>
      </div>
    </>
  );
}
