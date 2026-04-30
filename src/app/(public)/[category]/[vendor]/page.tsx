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
import { FaqList } from "../../_components/FaqList";

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
  const vendors = await db.vendor.findMany({
    where: { status: "published" },
    select: { slug: true, category: { select: { slug: true } } },
  });
  // Pre-render both /<category>/<vendor> and /<category>/<vendor>-alternatives
  return vendors.flatMap((v) => [
    { category: v.category.slug, vendor: v.slug },
    { category: v.category.slug, vendor: `${v.slug}-alternatives` },
  ]);
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
    title: `${vendor.name} review | The Hub`,
    description: vendor.descriptionShort ?? vendor.tagline ?? `${vendor.name} review and pricing.`,
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

  // Fetch competitors (alternatives shows 8, profile shows 4)
  const competitors = await db.vendor.findMany({
    where: {
      categoryId: vendor.categoryId,
      status: "published",
      slug: { not: vendor.slug },
    },
  });
  const sortedCompetitors = [...competitors].sort((a, b) => displayRank(b) - displayRank(a));

  if (isAlternatives) {
    const alternatives = sortedCompetitors.slice(0, 8);
    return (
      <>
        <PageHero
          eyebrow={vendor.category.name}
          title={`${vendor.name} alternatives`}
          description={`Looking for an alternative to ${vendor.name}? Here are the top ${alternatives.length} alternatives in ${vendor.category.name.toLowerCase()}.`}
        />
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="mb-6">
            <Link href={`/${vendor.category.slug}/${vendor.slug}`} className="text-sm text-slate-600 underline hover:text-slate-900">
              Back to {vendor.name}
            </Link>
          </div>
          <ol className="space-y-4">
            {alternatives.map((alt, i) => (
              <li key={alt.id} className="rounded-lg border border-slate-200 bg-white p-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-2xl font-bold text-slate-300">#{i + 1}</span>
                  <Link href={`/${vendor.category.slug}/${alt.slug}`} className="text-lg font-semibold text-slate-900 hover:underline">
                    {alt.name}
                  </Link>
                  <ScorePill score={alt.ourScore} />
                  {alt.sponsorTier !== "none" ? <SponsoredBadge /> : null}
                </div>
                {alt.tagline ? <p className="mt-2 text-sm text-slate-600">{alt.tagline}</p> : null}
              </li>
            ))}
          </ol>
        </div>
      </>
    );
  }

  // Profile view
  const closestCompetitors = sortedCompetitors.slice(0, 4);
  const faqs = [
    {
      q: `What is ${vendor.name}?`,
      a: vendor.descriptionShort ?? `${vendor.name} is a ${vendor.category.name.toLowerCase()} platform.`,
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
  ];

  return (
    <>
      <PageHero
        eyebrow={vendor.category.name}
        title={vendor.name}
        description={vendor.tagline ?? undefined}
      />
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="flex flex-wrap items-center gap-3">
          <ScorePill score={vendor.ourScore} />
          {vendor.sponsorTier !== "none" ? <SponsoredBadge /> : null}
          <a
            href={vendor.websiteUrl}
            target="_blank"
            rel="nofollow sponsored noopener"
            className="ml-auto inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
          >
            Visit website
          </a>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-4 rounded-lg border border-slate-200 bg-white p-5 text-sm md:grid-cols-4">
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Pricing</dt>
            <dd className="mt-1 text-slate-900">
              {vendor.pricingStartingAt ?? PRICING_LABELS[vendor.pricingModel] ?? vendor.pricingModel}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-slate-500">Best for</dt>
            <dd className="mt-1 text-slate-900">{SEGMENT_LABELS[vendor.bestForSegment] ?? vendor.bestForSegment}</dd>
          </div>
          {vendor.foundedYear ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">Founded</dt>
              <dd className="mt-1 text-slate-900">{vendor.foundedYear}</dd>
            </div>
          ) : null}
          {vendor.hqLocation ? (
            <div>
              <dt className="text-xs uppercase tracking-wide text-slate-500">HQ</dt>
              <dd className="mt-1 text-slate-900">{vendor.hqLocation}</dd>
            </div>
          ) : null}
        </dl>

        {vendor.descriptionLong ? (
          <section className="mt-8">
            <Markdown>{vendor.descriptionLong}</Markdown>
          </section>
        ) : null}

        {vendor.keyFeatures.length > 0 ? (
          <section className="mt-8">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Key features</h2>
            <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {vendor.keyFeatures.map((f) => (
                <li key={f} className="rounded border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">{f}</li>
              ))}
            </ul>
          </section>
        ) : null}

        {(vendor.pros.length > 0 || vendor.cons.length > 0) ? (
          <section className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Pros</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {vendor.pros.map((p) => <li key={p}>{p}</li>)}
              </ul>
            </div>
            <div>
              <h2 className="mb-3 text-lg font-semibold text-slate-900">Cons</h2>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {vendor.cons.map((c) => <li key={c}>{c}</li>)}
              </ul>
            </div>
          </section>
        ) : null}

        {closestCompetitors.length > 0 ? (
          <section className="mt-10">
            <div className="mb-3 flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-slate-900">How {vendor.name} compares</h2>
              <Link href={`/${vendor.category.slug}/${vendor.slug}-alternatives`} className="text-sm text-slate-600 underline">
                See top {Math.min(8, sortedCompetitors.length)} alternatives
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {closestCompetitors.map((c) => (
                <VendorCard
                  key={c.id}
                  href={`/${vendor.category.slug}/${c.slug}`}
                  name={c.name}
                  tagline={c.tagline}
                  ourScore={c.ourScore}
                  sponsored={c.sponsorTier !== "none"}
                />
              ))}
            </div>
          </section>
        ) : null}

        <FaqList items={faqs} />
      </div>
    </>
  );
}
