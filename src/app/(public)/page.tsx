import Link from "next/link";
import { db } from "@/lib/db";
import { VendorLogo } from "./_components/VendorLogo";
import { ScorePill } from "./_components/ScorePill";
import { Masthead } from "./_components/Masthead";
import { VendorMarquee } from "./_components/Marquee";
import { EditorMark, SectionBreak } from "./_components/EditorMark";
import { displayRank } from "@/lib/ranking";

export const revalidate = 3600;

export default async function HomePage() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { vendors: true } },
      vendors: {
        where: { status: "published" },
        orderBy: [{ ourScore: "desc" }],
        take: 5,
      },
    },
  });

  const vendorCount = await db.vendor.count({ where: { status: "published" } });
  const comparisonCount = await db.comparison.count({ where: { isPublished: true } });

  // Top-rated picks across the whole site
  const allVendors = await db.vendor.findMany({
    where: { status: "published" },
    include: { category: true },
  });
  const topPicks = [...allVendors]
    .sort((a, b) => displayRank(b) - displayRank(a))
    .slice(0, 6);

  // Marquee strip - shuffle picks
  const marqueeVendors = [...allVendors]
    .sort(() => Math.random() - 0.5)
    .slice(0, 14)
    .map((v) => ({ name: v.name, websiteUrl: v.websiteUrl, logoUrl: v.logoUrl }));

  // Recent comparisons strip
  const recentComparisons = await db.comparison.findMany({
    where: { isPublished: true },
    orderBy: { updatedAt: "desc" },
    take: 6,
    include: { vendorA: true, vendorB: true },
  });

  return (
    <>
      <Masthead volume="I" issue="01" edition="The B2B Software Trade Edition" />

      {/* Big editorial hero */}
      <section className="relative border-b border-[var(--color-rule)] bg-[var(--color-cream)] paper-grain overflow-hidden">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          {/* Decorative ornament floating top right */}
          <div className="absolute right-6 top-10 hidden text-[var(--color-gold)] md:block" aria-hidden>
            <EditorMark size={28} />
          </div>

          <p className="flourish font-mono text-[10px] uppercase tracking-[0.28em] text-[var(--color-forest)]">
            The B2B Software Hub
          </p>

          <h1
            className="mt-6 max-w-5xl font-display font-semibold leading-[0.98] tracking-tight text-[var(--color-ink)] text-5xl md:text-7xl lg:text-[5.5rem] fade-rise"
            style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 50" }}
          >
            B2B software,{" "}
            <span
              className="italic text-[var(--color-forest)]"
              style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}
            >
              honestly
            </span>{" "}
            <br className="hidden md:block" />
            compared.
          </h1>

          <p
            className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-soft)] md:text-xl fade-rise"
            style={{ animationDelay: "120ms" }}
          >
            Editorial reviews and side-by-side comparisons of the software that runs serious
            businesses. Independent scores. Real pros and cons. No pay-to-rank.
          </p>

          <div
            className="mt-10 flex flex-wrap items-end gap-x-12 gap-y-6 border-t border-[var(--color-rule)] pt-8 fade-rise"
            style={{ animationDelay: "240ms" }}
          >
            <Stat label="Categories tracked" value={categories.length} />
            <Stat label="Vendors compared" value={vendorCount} />
            <Stat label="Side-by-side reviews" value={comparisonCount} />
            <Stat label="Updated" value="Quarterly" wide />
          </div>
        </div>
      </section>

      {/* Marquee */}
      <VendorMarquee vendors={marqueeVendors} label="In this issue" />

      {/* Categories */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <SectionHead
          eyebrow="The library"
          title="Pick your category."
          aside={`${categories.length} sectors`}
        />
        <div className="mt-12 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const featured = c.vendors[0];
            return (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="group relative flex h-full flex-col justify-between border border-[var(--color-rule)] bg-[var(--color-cream)] p-6 card-lift"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-forest)]">
                      No. {(i + 1).toString().padStart(2, "0")}
                    </p>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-subtle)]">
                      {c._count.vendors} reviewed
                    </span>
                  </div>
                  <h3 className="mt-4 font-display text-[1.65rem] font-semibold leading-[1.05] text-[var(--color-ink)] group-hover:text-[var(--color-forest)]">
                    {c.name}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-[15px] leading-relaxed text-[var(--color-ink-muted)]">
                    {c.description}
                  </p>
                </div>

                {featured ? (
                  <div className="mt-6 border-t border-dashed border-[var(--color-rule)] pt-4">
                    <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-subtle)]">
                      Editor pick
                    </p>
                    <div className="mt-2 flex items-center gap-3">
                      <VendorLogo vendor={featured} size={28} rounded="md" />
                      <span className="font-display text-base font-semibold text-[var(--color-ink)]">
                        {featured.name}
                      </span>
                      <ScorePill score={featured.ourScore} size="sm" />
                    </div>
                  </div>
                ) : null}

                <div className="mt-5 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {c.vendors.slice(0, 4).map((v) => (
                      <VendorLogo
                        key={v.name}
                        vendor={v}
                        size={26}
                        rounded="full"
                        className="ring-2 ring-[var(--color-cream)]"
                      />
                    ))}
                    {c._count.vendors > 4 ? (
                      <span className="z-10 inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[var(--color-forest)] font-mono text-[9px] font-medium text-[var(--color-cream)] ring-2 ring-[var(--color-cream)]">
                        +{c._count.vendors - 4}
                      </span>
                    ) : null}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-ink-subtle)] group-hover:text-[var(--color-forest)]">
                    Browse →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <SectionBreak />

      {/* Top picks */}
      <section className="border-y border-[var(--color-rule)] bg-[var(--color-cream-soft)]">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <SectionHead
            eyebrow="Editor's picks"
            title="The highest-rated software, across every category."
            aside="Top 6"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topPicks.map((v, i) => (
              <Link
                key={v.id}
                href={`/${v.category.slug}/${v.slug}`}
                className="group relative flex items-start gap-4 border border-[var(--color-rule)] bg-[var(--color-cream)] p-5 card-lift"
              >
                <span className="absolute left-0 top-0 bg-[var(--color-forest)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--color-cream)]">
                  No. {(i + 1).toString().padStart(2, "0")}
                </span>
                <VendorLogo vendor={v} size={56} rounded="md" className="mt-3" />
                <div className="mt-3 min-w-0 flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-forest)]">
                    {v.category.name}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-forest)]">
                    {v.name}
                  </h3>
                  {v.tagline ? (
                    <p className="mt-1 line-clamp-2 text-[13px] text-[var(--color-ink-muted)]">{v.tagline}</p>
                  ) : null}
                </div>
                <ScorePill score={v.ourScore} size="sm" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Recent comparisons */}
      {recentComparisons.length > 0 ? (
        <section className="mx-auto max-w-6xl px-6 py-20">
          <SectionHead
            eyebrow="Side-by-side"
            title="Recent comparisons."
            aside={`${recentComparisons.length} pairs`}
          />
          <ul className="mt-12 grid gap-4 md:grid-cols-2">
            {recentComparisons.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/compare/${c.slug}`}
                  className="group flex items-center justify-between gap-3 border border-[var(--color-rule)] bg-[var(--color-cream)] px-5 py-4 card-lift"
                >
                  <div className="flex items-center gap-3">
                    <VendorLogo vendor={c.vendorA} size={32} rounded="md" />
                    <span className="font-display text-base font-semibold text-[var(--color-ink)]">
                      {c.vendorA.name}
                    </span>
                    <span className="font-mono text-[10px] italic uppercase tracking-[0.22em] text-[var(--color-forest)]">
                      vs
                    </span>
                    <span className="font-display text-base font-semibold text-[var(--color-ink)]">
                      {c.vendorB.name}
                    </span>
                    <VendorLogo vendor={c.vendorB} size={32} rounded="md" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-forest)] opacity-0 transition-opacity group-hover:opacity-100">
                    Read →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* Trust block - dramatic forest panel */}
      <section className="relative border-t border-[var(--color-rule)] bg-[var(--color-forest)] text-[var(--color-cream)] overflow-hidden">
        <div className="absolute inset-0 shine" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-10 md:grid-cols-[1fr_1fr]">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-gold)]">
                How we evaluate
              </p>
              <h2 className="mt-4 font-display text-3xl font-semibold leading-tight md:text-5xl">
                Editorial scores.{" "}
                <span
                  className="italic text-[var(--color-gold)]"
                  style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 100" }}
                >
                  Real
                </span>{" "}
                reviews.
                <br />
                No pay-to-rank.
              </h2>
            </div>
            <div className="space-y-4 text-[15px] leading-relaxed text-[var(--color-cream)] opacity-90">
              <p>
                Our 1-to-10 scores come from hands-on research, real customer reviews, pricing
                transparency, and integration breadth. Vendors can sponsor placements - they&apos;re
                always disclosed and never replace editorial judgment.
              </p>
              <p>
                We update scores quarterly and ship reviews regardless of who advertises with us.
              </p>
              <Link
                href="/methodology"
                className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--color-gold)] link-underline"
              >
                Read the full methodology →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({ label, value, wide }: { label: string; value: number | string; wide?: boolean }) {
  return (
    <div className={wide ? "min-w-[140px]" : ""}>
      <p
        className="font-display text-4xl font-semibold leading-none text-[var(--color-ink)] md:text-5xl"
        style={{ fontVariationSettings: "'opsz' 144" }}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-muted)]">
        {label}
      </p>
    </div>
  );
}

function SectionHead({ eyebrow, title, aside }: { eyebrow: string; title: string; aside?: string }) {
  return (
    <header className="flex items-end justify-between gap-6 border-b border-[var(--color-rule)] pb-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-forest)]">
          {eyebrow}
        </p>
        <h2
          className="mt-3 font-display text-3xl font-semibold leading-[1.05] tracking-tight text-[var(--color-ink)] md:text-5xl"
          style={{ fontVariationSettings: "'opsz' 144" }}
        >
          {title}
        </h2>
      </div>
      {aside ? (
        <span className="hidden font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--color-ink-subtle)] sm:block">
          {aside}
        </span>
      ) : null}
    </header>
  );
}
