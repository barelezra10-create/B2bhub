import Link from "next/link";
import { db } from "@/lib/db";
import { VendorLogo } from "./_components/VendorLogo";
import { ScorePill } from "./_components/ScorePill";
import { VendorMarquee } from "./_components/Marquee";
import { displayRank } from "@/lib/ranking";

export const revalidate = 3600;

const PASTELS = [
  "var(--pastel-peach)",
  "var(--pastel-mint)",
  "var(--pastel-sky)",
  "var(--pastel-lavender)",
  "var(--pastel-rose)",
  "var(--pastel-yellow)",
  "var(--pastel-coral)",
];

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

  const allVendors = await db.vendor.findMany({
    where: { status: "published" },
    include: { category: true },
  });
  const topPicks = [...allVendors]
    .sort((a, b) => displayRank(b) - displayRank(a))
    .slice(0, 6);

  const marqueeVendors = [...allVendors]
    .sort(() => Math.random() - 0.5)
    .slice(0, 14)
    .map((v) => ({ name: v.name, websiteUrl: v.websiteUrl, logoUrl: v.logoUrl }));

  const recentComparisons = await db.comparison.findMany({
    where: { isPublished: true },
    orderBy: { updatedAt: "desc" },
    take: 6,
    include: { vendorA: true, vendorB: true },
  });

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg)] blobs">
        <div className="relative container-x py-20 md:py-28 lg:py-32">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-elev)] px-3 py-1 text-xs shadow-warm">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] pulse-dot" aria-hidden />
              <span className="font-mono uppercase tracking-[0.18em] text-[var(--fg-muted)]">
                Live · {categories.length} categories tracked
              </span>
            </span>
          </div>

          <h1 className="mt-8 max-w-5xl font-display font-bold leading-[0.92] tracking-tight text-[var(--fg)] text-5xl md:text-7xl lg:text-[5.5rem] fade-rise">
            B2B software,{" "}
            <span className="text-gradient">honestly</span>
            <br className="hidden md:block" /> compared.
          </h1>

          <p
            className="mt-8 max-w-2xl text-lg leading-relaxed text-[var(--fg-soft)] md:text-xl fade-rise"
            style={{ animationDelay: "120ms" }}
          >
            Editorial scores. Real reviews. No pay-to-rank. {vendorCount} vendors
            across {categories.length} categories - sliced into honest comparisons
            you can actually use.
          </p>

          <div
            className="mt-10 flex flex-wrap items-center gap-3 fade-rise"
            style={{ animationDelay: "240ms" }}
          >
            <Link href="/crm-software" className="btn-primary">
              Browse all software
              <span aria-hidden>→</span>
            </Link>
            <Link href="/compare/square-vs-stripe" className="btn-outline">
              See a comparison
              <span aria-hidden>↗</span>
            </Link>
          </div>

          <div
            className="mt-14 grid grid-cols-2 gap-6 border-t border-[var(--border)] pt-8 sm:grid-cols-4 fade-rise"
            style={{ animationDelay: "360ms" }}
          >
            <Stat label="Categories" value={categories.length} />
            <Stat label="Vendors" value={vendorCount} />
            <Stat label="Comparisons" value={comparisonCount} />
            <Stat label="Pay-to-rank" value="0" highlight />
          </div>
        </div>
      </section>

      {/* Marquee */}
      <VendorMarquee vendors={marqueeVendors} label="We cover" />

      {/* CATEGORIES - pastel bento */}
      <section className="container-x py-24">
        <SectionHead
          eyebrow="The library"
          title={
            <>
              Pick your <span className="text-gradient">category</span>.
            </>
          }
          aside={`${categories.length} sectors`}
        />
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const featured = c.vendors[0];
            const tint = PASTELS[i % PASTELS.length];
            return (
              <Link
                key={c.slug}
                href={`/${c.slug}`}
                className="group card relative flex h-full flex-col justify-between p-6 overflow-hidden"
              >
                <span
                  className="absolute -right-12 -top-12 h-40 w-40 rounded-full opacity-70 transition-transform duration-300 group-hover:scale-110"
                  style={{ background: tint }}
                  aria-hidden
                />
                <div className="relative">
                  <div className="flex items-center justify-between">
                    <span className="chip chip-accent">
                      No. {(i + 1).toString().padStart(2, "0")}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--fg-muted)]">
                      {c._count.vendors} reviewed
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-bold leading-[1.1] tracking-tight text-[var(--fg)]">
                    {c.name}
                  </h3>
                  <p className="mt-3 line-clamp-3 text-[14px] leading-relaxed text-[var(--fg-muted)]">
                    {c.description}
                  </p>
                </div>

                {featured ? (
                  <div className="relative mt-6 flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg)] p-3 shadow-warm">
                    <VendorLogo vendor={featured} size={32} rounded="md" />
                    <div className="min-w-0 flex-1">
                      <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-[var(--accent-deep)]">
                        Editor pick
                      </p>
                      <span className="font-display text-sm font-bold text-[var(--fg)]">
                        {featured.name}
                      </span>
                    </div>
                    <ScorePill score={featured.ourScore} size="sm" />
                  </div>
                ) : null}

                <div className="relative mt-5 flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {c.vendors.slice(0, 4).map((v) => (
                      <VendorLogo
                        key={v.name}
                        vendor={v}
                        size={26}
                        rounded="full"
                        className="ring-2 ring-[var(--bg)]"
                      />
                    ))}
                    {c._count.vendors > 4 ? (
                      <span className="z-10 inline-flex h-[26px] w-[26px] items-center justify-center rounded-full bg-[var(--accent)] font-mono text-[9px] font-bold text-white ring-2 ring-[var(--bg)]">
                        +{c._count.vendors - 4}
                      </span>
                    ) : null}
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--fg-subtle)] transition-colors group-hover:text-[var(--accent)]">
                    Browse →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* TOP PICKS */}
      <section className="border-y border-[var(--border)] bg-[var(--bg-elev)]">
        <div className="container-x py-24">
          <SectionHead
            eyebrow="Editor's picks"
            title={
              <>
                The highest-rated software,
                <br className="hidden md:block" /> across <span className="text-gradient">every category</span>.
              </>
            }
            aside="Top 6"
          />
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {topPicks.map((v, i) => (
              <Link
                key={v.id}
                href={`/${v.category.slug}/${v.slug}`}
                className="group card relative flex items-start gap-4 p-5 overflow-hidden"
              >
                <span className="absolute left-0 top-0 rounded-tl-2xl rounded-br-md bg-[var(--accent)] px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-white">
                  No. {(i + 1).toString().padStart(2, "0")}
                </span>
                <VendorLogo vendor={v} size={56} rounded="md" className="mt-3" />
                <div className="mt-3 min-w-0 flex-1">
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent-deep)] font-semibold">
                    {v.category.name}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold leading-tight text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors">
                    {v.name}
                  </h3>
                  {v.tagline ? (
                    <p className="mt-1 line-clamp-2 text-[13px] text-[var(--fg-muted)]">{v.tagline}</p>
                  ) : null}
                </div>
                <ScorePill score={v.ourScore} size="sm" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RECENT COMPARISONS */}
      {recentComparisons.length > 0 ? (
        <section className="container-x py-24">
          <SectionHead
            eyebrow="Side-by-side"
            title={
              <>
                Recent <span className="text-gradient">comparisons</span>.
              </>
            }
            aside={`${recentComparisons.length} pairs`}
          />
          <ul className="mt-14 grid gap-4 md:grid-cols-2">
            {recentComparisons.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/compare/${c.slug}`}
                  className="group card flex items-center justify-between gap-3 px-5 py-4"
                >
                  <div className="flex items-center gap-3">
                    <VendorLogo vendor={c.vendorA} size={32} rounded="md" />
                    <span className="font-display text-base font-bold text-[var(--fg)]">
                      {c.vendorA.name}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] font-bold text-[var(--accent)]">
                      vs
                    </span>
                    <span className="font-display text-base font-bold text-[var(--fg)]">
                      {c.vendorB.name}
                    </span>
                    <VendorLogo vendor={c.vendorB} size={32} rounded="md" />
                  </div>
                  <span className="font-mono text-[10px] uppercase tracking-[0.22em] font-semibold text-[var(--fg-subtle)] transition-colors group-hover:text-[var(--accent)]">
                    Read →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {/* TRUST */}
      <section className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--bg-elev-2)]">
        <div className="absolute -right-32 -top-32 h-[400px] w-[400px] rounded-full opacity-50" style={{ background: "radial-gradient(circle, var(--pastel-peach), transparent 70%)" }} aria-hidden />
        <div className="absolute -left-32 -bottom-32 h-[400px] w-[400px] rounded-full opacity-50" style={{ background: "radial-gradient(circle, var(--pastel-coral), transparent 70%)" }} aria-hidden />
        <div className="relative container-x py-24">
          <div className="grid gap-12 md:grid-cols-[1fr_1fr] md:items-end">
            <div>
              <p className="eyebrow">How we evaluate</p>
              <h2 className="mt-6 font-display text-4xl font-bold leading-[0.95] tracking-tight text-[var(--fg)] md:text-6xl">
                Editorial scores.{" "}
                <span className="text-gradient">Real</span> reviews.
                <br />
                No pay-to-rank.
              </h2>
            </div>
            <div className="space-y-5 text-[15px] leading-relaxed text-[var(--fg-soft)]">
              <p>
                Our 1-to-10 scores come from hands-on research, real customer reviews, pricing
                transparency, and integration breadth. Vendors can sponsor placements -
                they&apos;re always disclosed and never replace editorial judgment.
              </p>
              <p>
                We update scores quarterly and ship reviews regardless of who advertises with us.
              </p>
              <Link href="/methodology" className="btn-outline">
                Read the methodology
                <span aria-hidden>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  highlight,
}: {
  label: string;
  value: number | string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p
        className={`font-display text-4xl font-bold leading-none md:text-5xl ${
          highlight ? "text-[var(--accent)]" : "text-[var(--fg)]"
        }`}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      <p className="mt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--fg-muted)]">
        {label}
      </p>
    </div>
  );
}

function SectionHead({
  eyebrow,
  title,
  aside,
}: {
  eyebrow: string;
  title: React.ReactNode;
  aside?: string;
}) {
  return (
    <header className="flex items-end justify-between gap-6 border-b border-[var(--border)] pb-6">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-4 font-display text-4xl font-bold leading-[0.95] tracking-tight text-[var(--fg)] md:text-5xl">
          {title}
        </h2>
      </div>
      {aside ? (
        <span className="hidden font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--fg-subtle)] sm:block">
          {aside}
        </span>
      ) : null}
    </header>
  );
}
