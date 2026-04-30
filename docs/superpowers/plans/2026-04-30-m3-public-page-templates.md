# M3: Public Page Templates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Render all six public page types from the M2 data, replace the "Coming soon" homepage with a real landing page, wire `revalidatePath()` from admin actions to public routes, and deploy to Railway. After M3 the public site is live with the seeded categories, vendors, comparisons, and buyer guides.

**Architecture:** Server Components throughout for SEO. ISR via `revalidate: 3600` per page so content stays static-fast but auto-refreshes hourly. Admin edits trigger `revalidatePath()` for affected public routes so changes appear within ~1 second. Markdown rendered server-side via `react-markdown + remark-gfm`. Tailwind v4 styling with shared layout components. Six page types live under a `(public)` route group so they share a Header / Footer without affecting URLs.

**Tech Stack:** Next.js 16 App Router (Server Components, ISR), Prisma 7 with `@prisma/adapter-pg`, Tailwind v4, react-markdown, remark-gfm, schema.org JSON-LD inline.

---

## File Structure

```
b2b-hub/
├── src/
│   ├── lib/
│   │   ├── ranking.ts                                  # NEW - displayRank, top-N picker
│   │   ├── markdown.tsx                                # NEW - shared <Markdown> wrapper
│   │   └── revalidate.ts                               # MODIFY - add public path revalidation
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── layout.tsx                              # NEW - public layout (Header + Footer)
│   │   │   ├── page.tsx                                # NEW - homepage (replaces src/app/page.tsx)
│   │   │   ├── _components/
│   │   │   │   ├── SiteHeader.tsx                      # NEW
│   │   │   │   ├── SiteFooter.tsx                      # NEW
│   │   │   │   ├── VendorCard.tsx                      # NEW
│   │   │   │   ├── VendorRankRow.tsx                   # NEW (numbered top-N row)
│   │   │   │   ├── SponsoredBadge.tsx                  # NEW
│   │   │   │   ├── ScorePill.tsx                       # NEW
│   │   │   │   ├── PageHero.tsx                        # NEW (shared hero)
│   │   │   │   └── FaqList.tsx                         # NEW
│   │   │   ├── [category]/
│   │   │   │   ├── page.tsx                            # NEW - category overview
│   │   │   │   ├── best/page.tsx                       # NEW - top-N list
│   │   │   │   ├── buyers-guide/page.tsx               # NEW - buyer guide
│   │   │   │   └── [vendor]/
│   │   │   │       └── page.tsx                        # NEW - vendor profile (and alternatives via suffix)
│   │   │   └── compare/
│   │   │       └── [slug]/page.tsx                     # NEW - vs comparison page
│   │   └── page.tsx                                    # DELETE (moved into (public))
│   ├── app/admin/
│   │   ├── categories/actions.ts                       # MODIFY - call revalidate helpers
│   │   ├── vendors/actions.ts                          # MODIFY - same
│   │   ├── comparisons/actions.ts                      # MODIFY - same
│   │   └── buyer-guides/actions.ts                     # MODIFY - same
│   └── app/layout.tsx                                  # KEEP (root layout stays minimal)
└── tests/
    └── lib/
        └── ranking.test.ts                             # NEW
```

**Note on `[vendor]-alternatives`:** Next.js 16 doesn't support a literal suffix in a dynamic segment. We handle alternatives in two ways:
1. The `[vendor]/page.tsx` checks if the segment ends with `-alternatives` and, if so, looks up the base vendor and renders the alternatives view; otherwise renders the profile.
2. Cleaner alternative: a separate route `[category]/[vendor]/alternatives/page.tsx` -- BUT the spec calls for the URL `/[category]/[vendor]-alternatives` (suffix on the slug, not a sub-route).

Going with option 1. Implementation detail in Task 7.

---

## Task 1: Install markdown deps and add `<Markdown>` helper

**Files:**
- Modify: `package.json`
- Create: `src/lib/markdown.tsx`

- [ ] **Step 1: Install deps**

```bash
cd ~/b2b-hub
pnpm add react-markdown remark-gfm
```

- [ ] **Step 2: Create `src/lib/markdown.tsx`**

```tsx
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Markdown({ children }: { children: string }) {
  return (
    <div className="prose prose-slate max-w-none prose-headings:font-semibold prose-h2:mt-8 prose-h2:mb-3 prose-h3:mt-6 prose-h3:mb-2 prose-p:leading-relaxed">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{children}</ReactMarkdown>
    </div>
  );
}
```

(Tailwind's typography plugin is not currently installed. We'll either install `@tailwindcss/typography` here OR style markdown elements manually. **Default: install the plugin.**)

- [ ] **Step 3: Install Tailwind typography plugin**

```bash
pnpm add -D @tailwindcss/typography
```

Add to `globals.css` Tailwind v4 imports:

```css
@import "tailwindcss";
@plugin "@tailwindcss/typography";
```

(Add the `@plugin` line after the existing `@import` line in `src/app/globals.css`.)

- [ ] **Step 4: Quick TS check**

```bash
pnpm tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml src/lib/markdown.tsx src/app/globals.css
git commit -m "feat(m3): add react-markdown + remark-gfm + tailwind typography for content rendering"
```

---

## Task 2: Ranking helper with TDD

**Files:**
- Create: `src/lib/ranking.ts`, `tests/lib/ranking.test.ts`

- [ ] **Step 1: Write failing tests**

`tests/lib/ranking.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { displayRank, pickTopN } from "@/lib/ranking";

describe("displayRank", () => {
  it("returns ourScore when not sponsored", () => {
    expect(displayRank({ ourScore: 8, sponsorTier: "none", sponsorRankBoost: 0 })).toBe(8);
  });

  it("adds sponsorRankBoost when sponsored", () => {
    expect(displayRank({ ourScore: 7, sponsorTier: "featured", sponsorRankBoost: 2 })).toBe(9);
  });

  it("treats null ourScore as 0", () => {
    expect(displayRank({ ourScore: null, sponsorTier: "none", sponsorRankBoost: 0 })).toBe(0);
  });

  it("clamps boost to max +2", () => {
    expect(displayRank({ ourScore: 5, sponsorTier: "premium", sponsorRankBoost: 5 })).toBe(7);
  });
});

describe("pickTopN", () => {
  const v = (slug: string, ourScore: number | null, boost = 0) => ({
    slug,
    ourScore,
    sponsorTier: boost > 0 ? "featured" : "none",
    sponsorRankBoost: boost,
  }) as const;

  it("returns top-N sorted by displayRank desc", () => {
    const result = pickTopN([
      v("a", 7),
      v("b", 9),
      v("c", 8),
    ], 2);
    expect(result.map((x) => x.slug)).toEqual(["b", "c"]);
  });

  it("excludes vendors with ourScore < 6", () => {
    const result = pickTopN([
      v("a", 5),
      v("b", 8),
      v("c", null),
    ], 5);
    expect(result.map((x) => x.slug)).toEqual(["b"]);
  });

  it("respects sponsor boost in ordering but never below ourScore 6", () => {
    const result = pickTopN([
      v("a", 5, 2),    // displayRank 7 but ourScore < 6 - excluded
      v("b", 6, 0),    // displayRank 6
      v("c", 7, 1),    // displayRank 8
    ], 5);
    expect(result.map((x) => x.slug)).toEqual(["c", "b"]);
  });
});
```

- [ ] **Step 2: Run, expect failures**

```bash
pnpm test ranking
```

- [ ] **Step 3: Implement**

`src/lib/ranking.ts`:

```typescript
type RankableVendor = {
  slug: string;
  ourScore: number | null;
  sponsorTier: string;
  sponsorRankBoost: number;
};

const MAX_BOOST = 2;
const MIN_TOP_N_SCORE = 6;

export function displayRank(v: Pick<RankableVendor, "ourScore" | "sponsorTier" | "sponsorRankBoost">): number {
  const score = v.ourScore ?? 0;
  if (v.sponsorTier === "none") return score;
  const boost = Math.min(v.sponsorRankBoost, MAX_BOOST);
  return score + boost;
}

export function pickTopN<V extends RankableVendor>(vendors: V[], n: number): V[] {
  return vendors
    .filter((v) => v.ourScore !== null && v.ourScore >= MIN_TOP_N_SCORE)
    .sort((a, b) => displayRank(b) - displayRank(a))
    .slice(0, n);
}
```

- [ ] **Step 4: Run, expect 7/7 pass + full suite**

```bash
pnpm test ranking
pnpm test
```

Expected: ranking 7/7 + full suite 34/34.

- [ ] **Step 5: Commit**

```bash
git add src/lib/ranking.ts tests/lib/ranking.test.ts
git commit -m "feat(m3): add displayRank and pickTopN helpers with tests"
```

---

## Task 3: Public layout shell + Header/Footer + move homepage

**Files:**
- Create: `src/app/(public)/layout.tsx`, `src/app/(public)/page.tsx`, `src/app/(public)/_components/SiteHeader.tsx`, `src/app/(public)/_components/SiteFooter.tsx`, `src/app/(public)/_components/PageHero.tsx`
- Delete: `src/app/page.tsx`

- [ ] **Step 1: Create `SiteHeader.tsx`**

```tsx
import Link from "next/link";
import { db } from "@/lib/db";

export async function SiteHeader() {
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
    select: { slug: true, name: true },
  });

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-base font-semibold text-slate-900">
          The Hub
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-700">
          {categories.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className="hover:text-slate-900">
              {c.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create `SiteFooter.tsx`**

```tsx
import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/methodology", label: "How we evaluate" },
  { href: "/editorial-standards", label: "Editorial standards" },
  { href: "/contact", label: "Contact" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-8 text-sm text-slate-600">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-slate-900">
              {l.label}
            </Link>
          ))}
        </div>
        <p className="mt-4 text-xs text-slate-500">
          (c) {new Date().getFullYear()} The Hub. Editorial scores are our own. Some links may be sponsored.
        </p>
      </div>
    </footer>
  );
}
```

(About / methodology / editorial-standards / contact pages are stubs in M5. The links 404 for now -- intentional, not blocking.)

- [ ] **Step 3: Create `PageHero.tsx`**

```tsx
export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-base text-slate-600">{description}</p> : null}
      </div>
    </section>
  );
}
```

- [ ] **Step 4: Create public layout**

`src/app/(public)/layout.tsx`:

```tsx
import { SiteHeader } from "./_components/SiteHeader";
import { SiteFooter } from "./_components/SiteFooter";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="min-h-[60vh]">{children}</main>
      <SiteFooter />
    </>
  );
}
```

- [ ] **Step 5: Move homepage into the public group**

Delete `src/app/page.tsx` and create `src/app/(public)/page.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { PageHero } from "./_components/PageHero";

export const revalidate = 3600;

export default async function HomePage() {
  const [categories, vendorCount] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      include: { _count: { select: { vendors: true } } },
    }),
    db.vendor.count({ where: { status: "published" } }),
  ]);

  return (
    <>
      <PageHero
        eyebrow="B2B software, honestly compared"
        title="Find the right software for your business"
        description={`Editorial reviews and side-by-side comparisons across ${categories.length} categories and ${vendorCount} vendors. No fluff, no fake awards.`}
      />
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="mb-6 text-xl font-semibold text-slate-900">Browse by category</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="block rounded-lg border border-slate-200 bg-white p-6 transition hover:border-slate-400"
            >
              <h3 className="text-lg font-semibold text-slate-900">{c.name}</h3>
              <p className="mt-2 line-clamp-3 text-sm text-slate-600">{c.description}</p>
              <p className="mt-3 text-xs text-slate-500">{c._count.vendors} vendors compared</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
```

- [ ] **Step 6: Smoke test**

```bash
pnpm dev > /tmp/dev-m3-3.log 2>&1 &
DEV=$!
sleep 7
PORT=$(grep -oE "localhost:[0-9]+" /tmp/dev-m3-3.log | head -1 | cut -d: -f2)
PORT=${PORT:-3000}

curl -sS -o /tmp/home.html -w "HOME %{http_code}\n" "http://localhost:$PORT/"
grep -oE "(The Hub|Browse by category|Debt Collection|CRM Software)" /tmp/home.html | sort -u | head -6

kill $DEV 2>/dev/null
wait 2>/dev/null
true
```

Expected: HOME 200, all 6 category names should appear in the grid + Header/Footer markers.

- [ ] **Step 7: TS + tests**

```bash
pnpm tsc --noEmit
pnpm test
```

Expected: clean, 34/34.

- [ ] **Step 8: Commit**

```bash
git add src/app/\(public\)/ -A
git rm src/app/page.tsx
git commit -m "feat(m3): public layout, header, footer, and homepage"
```

(Use the literal `(public)` filename. Shell-escape if needed.)

---

## Task 4: Shared vendor display components

**Files:**
- Create: `src/app/(public)/_components/SponsoredBadge.tsx`, `ScorePill.tsx`, `VendorCard.tsx`, `VendorRankRow.tsx`, `FaqList.tsx`

- [ ] **Step 1: Create `SponsoredBadge.tsx`**

```tsx
export function SponsoredBadge() {
  return (
    <span className="inline-flex items-center rounded bg-amber-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-900">
      Sponsored
    </span>
  );
}
```

- [ ] **Step 2: Create `ScorePill.tsx`**

```tsx
export function ScorePill({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-slate-400">No score</span>;
  const tone =
    score >= 9 ? "bg-emerald-100 text-emerald-900" :
    score >= 7 ? "bg-slate-900 text-white" :
    "bg-slate-200 text-slate-700";
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${tone}`}>
      {score.toFixed(1)} / 10
    </span>
  );
}
```

- [ ] **Step 3: Create `VendorCard.tsx`**

```tsx
import Link from "next/link";
import { ScorePill } from "./ScorePill";
import { SponsoredBadge } from "./SponsoredBadge";

export function VendorCard({
  href,
  name,
  tagline,
  ourScore,
  sponsored,
}: {
  href: string;
  name: string;
  tagline: string | null;
  ourScore: number | null;
  sponsored: boolean;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-slate-200 bg-white p-5 transition hover:border-slate-400"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-base font-semibold text-slate-900">{name}</h3>
        <ScorePill score={ourScore} />
      </div>
      {tagline ? <p className="mt-2 line-clamp-2 text-sm text-slate-600">{tagline}</p> : null}
      {sponsored ? <div className="mt-3"><SponsoredBadge /></div> : null}
    </Link>
  );
}
```

- [ ] **Step 4: Create `VendorRankRow.tsx`**

```tsx
import Link from "next/link";
import { ScorePill } from "./ScorePill";
import { SponsoredBadge } from "./SponsoredBadge";

export function VendorRankRow({
  rank,
  href,
  name,
  tagline,
  ourScore,
  pricingStartingAt,
  pros,
  cons,
  bestForLabel,
  sponsored,
}: {
  rank: number;
  href: string;
  name: string;
  tagline: string | null;
  ourScore: number | null;
  pricingStartingAt: string | null;
  pros: string[];
  cons: string[];
  bestForLabel: string;
  sponsored: boolean;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-6">
      <header className="flex flex-wrap items-center gap-3">
        <span className="text-3xl font-bold text-slate-300">#{rank}</span>
        <Link href={href} className="text-xl font-semibold text-slate-900 hover:underline">
          {name}
        </Link>
        <ScorePill score={ourScore} />
        {sponsored ? <SponsoredBadge /> : null}
      </header>
      {tagline ? <p className="mt-2 text-sm text-slate-600">{tagline}</p> : null}
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pros</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {pros.slice(0, 3).map((p) => <li key={p}>{p}</li>)}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cons</h4>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {cons.slice(0, 3).map((c) => <li key={c}>{c}</li>)}
          </ul>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-slate-500">
        <span>Best for: <span className="text-slate-700">{bestForLabel}</span></span>
        {pricingStartingAt ? <span>From <span className="text-slate-700">{pricingStartingAt}</span></span> : null}
      </div>
      <div className="mt-4">
        <Link href={href} className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700">
          See details
        </Link>
      </div>
    </article>
  );
}
```

- [ ] **Step 5: Create `FaqList.tsx`**

```tsx
export function FaqList({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">FAQ</h2>
      <dl className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {items.map((item) => (
          <div key={item.q} className="p-5">
            <dt className="font-medium text-slate-900">{item.q}</dt>
            <dd className="mt-2 text-sm text-slate-600">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
```

- [ ] **Step 6: TS + commit**

```bash
pnpm tsc --noEmit
git add src/app/\(public\)/_components/
git commit -m "feat(m3): vendor card, rank row, score pill, sponsored badge, FAQ list"
```

---

## Task 5: Category overview page

**Files:**
- Create: `src/app/(public)/[category]/page.tsx`

- [ ] **Step 1: Create the page**

`src/app/(public)/[category]/page.tsx`:

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { displayRank } from "@/lib/ranking";
import { PageHero } from "../_components/PageHero";
import { VendorCard } from "../_components/VendorCard";
import { FaqList } from "../_components/FaqList";

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
```

- [ ] **Step 2: Smoke test**

```bash
pnpm dev > /tmp/dev-m3-5.log 2>&1 &
DEV=$!
sleep 7
PORT=$(grep -oE "localhost:[0-9]+" /tmp/dev-m3-5.log | head -1 | cut -d: -f2)
PORT=${PORT:-3000}

curl -sS -o /tmp/cat.html -w "CATEGORY %{http_code}\n" "http://localhost:$PORT/debt-collection-software"
grep -oE "(Quantrax|DAKCS|Beam|Featured partners|FAQ|Buyer's guide|Top 5|Top 10)" /tmp/cat.html | sort -u

curl -sS -o /dev/null -w "404 NONEXISTENT %{http_code}\n" "http://localhost:$PORT/this-doesnt-exist"

kill $DEV 2>/dev/null
wait 2>/dev/null
true
```

Expected: CATEGORY 200 with vendor names, 404 NONEXISTENT 404.

- [ ] **Step 3: TS + tests**

```bash
pnpm tsc --noEmit && pnpm test
```

- [ ] **Step 4: Commit**

```bash
git add src/app/\(public\)/\[category\]/page.tsx
git commit -m "feat(m3): category overview page"
```

---

## Task 6: Top-N list page

**Files:**
- Create: `src/app/(public)/[category]/best/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { pickTopN } from "@/lib/ranking";
import { PageHero } from "../../_components/PageHero";
import { VendorRankRow } from "../../_components/VendorRankRow";
import { FaqList } from "../../_components/FaqList";

export const revalidate = 3600;

const SEGMENT_LABELS: Record<string, string> = {
  smb: "SMB",
  mid_market: "Mid-market",
  enterprise: "Enterprise",
  all: "All sizes",
};

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
```

- [ ] **Step 2: Smoke test all 6 categories**

```bash
pnpm dev > /tmp/dev-m3-6.log 2>&1 &
DEV=$!
sleep 7
PORT=$(grep -oE "localhost:[0-9]+" /tmp/dev-m3-6.log | head -1 | cut -d: -f2)
PORT=${PORT:-3000}

for slug in debt-collection-software business-funding-software merchant-services pos-systems peo-services crm-software; do
  curl -sS -o /tmp/best.html -w "$slug/best: %{http_code} -- " "http://localhost:$PORT/$slug/best"
  grep -c "Pros" /tmp/best.html | head -1
done

kill $DEV 2>/dev/null
wait 2>/dev/null
true
```

Expected: each path 200 with 5 vendors (Pros heading appears 5+ times per page).

- [ ] **Step 3: TS + commit**

```bash
pnpm tsc --noEmit
git add src/app/\(public\)/\[category\]/best/
git commit -m "feat(m3): top-N list page per category"
```

---

## Task 7: Vendor profile page (handles `-alternatives` suffix)

**Files:**
- Create: `src/app/(public)/[category]/[vendor]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
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
  const { category: categorySlug, vendor: rawVendorSegment } = await params;
  const { vendorSlug, isAlternatives } = parseSegment(rawVendorSegment);
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

  // Fetch competitors for both views (alternatives needs 8, profile shows 4)
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
```

- [ ] **Step 2: Smoke test profile + alternatives**

```bash
pnpm dev > /tmp/dev-m3-7.log 2>&1 &
DEV=$!
sleep 7
PORT=$(grep -oE "localhost:[0-9]+" /tmp/dev-m3-7.log | head -1 | cut -d: -f2)
PORT=${PORT:-3000}

curl -sS -o /tmp/profile.html -w "PROFILE %{http_code}\n" "http://localhost:$PORT/merchant-services/stripe"
grep -oE "(Visit website|Best for|Pros|Cons|How Stripe compares)" /tmp/profile.html | sort -u

curl -sS -o /tmp/alt.html -w "ALTERNATIVES %{http_code}\n" "http://localhost:$PORT/merchant-services/stripe-alternatives"
grep -oE "(Stripe alternatives|Helcim|Square|Stax|PayPal)" /tmp/alt.html | sort -u

curl -sS -o /dev/null -w "WRONG-CATEGORY %{http_code}\n" "http://localhost:$PORT/crm-software/stripe"

kill $DEV 2>/dev/null
wait 2>/dev/null
true
```

Expected: PROFILE 200 with markers, ALTERNATIVES 200 with competitor names, WRONG-CATEGORY 404.

- [ ] **Step 3: TS + commit**

```bash
pnpm tsc --noEmit
git add src/app/\(public\)/\[category\]/\[vendor\]/
git commit -m "feat(m3): vendor profile and alternatives pages (-alternatives suffix)"
```

---

## Task 8: Comparison (vs) page

**Files:**
- Create: `src/app/(public)/compare/[slug]/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Markdown } from "@/lib/markdown";
import { PageHero } from "../../_components/PageHero";
import { ScorePill } from "../../_components/ScorePill";

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
  const comparisons = await db.comparison.findMany({
    where: { isPublished: true },
    select: { slug: true },
  });
  return comparisons.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const cmp = await db.comparison.findUnique({
    where: { slug },
    include: { vendorA: true, vendorB: true },
  });
  if (!cmp) return {};
  return {
    title: `${cmp.vendorA.name} vs ${cmp.vendorB.name} | The Hub`,
    description: cmp.summaryCopy?.slice(0, 160) ?? `Side-by-side comparison of ${cmp.vendorA.name} and ${cmp.vendorB.name}.`,
  };
}

export default async function ComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cmp = await db.comparison.findUnique({
    where: { slug },
    include: {
      vendorA: { include: { category: true } },
      vendorB: { include: { category: true } },
    },
  });
  if (!cmp || !cmp.isPublished) notFound();

  const { vendorA: a, vendorB: b } = cmp;

  const rows: { label: string; a: React.ReactNode; b: React.ReactNode }[] = [
    {
      label: "Score",
      a: <ScorePill score={a.ourScore} />,
      b: <ScorePill score={b.ourScore} />,
    },
    {
      label: "Pricing",
      a: a.pricingStartingAt ?? PRICING_LABELS[a.pricingModel] ?? a.pricingModel,
      b: b.pricingStartingAt ?? PRICING_LABELS[b.pricingModel] ?? b.pricingModel,
    },
    {
      label: "Best for",
      a: SEGMENT_LABELS[a.bestForSegment] ?? a.bestForSegment,
      b: SEGMENT_LABELS[b.bestForSegment] ?? b.bestForSegment,
    },
    {
      label: "HQ",
      a: a.hqLocation ?? "-",
      b: b.hqLocation ?? "-",
    },
    {
      label: "Founded",
      a: a.foundedYear ?? "-",
      b: b.foundedYear ?? "-",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow="Comparison"
        title={`${a.name} vs ${b.name}`}
        description={cmp.hookCopy ?? undefined}
      />
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="grid gap-6 md:grid-cols-2">
          <ComparisonHeader vendor={a} />
          <ComparisonHeader vendor={b} />
        </div>

        {cmp.summaryCopy ? (
          <section className="mt-10 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Quick verdict</h2>
            <Markdown>{cmp.summaryCopy}</Markdown>
          </section>
        ) : null}

        <section className="mt-10 overflow-hidden rounded-lg border border-slate-200 bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-slate-700"></th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">{a.name}</th>
                <th className="px-4 py-2 text-left font-medium text-slate-700">{b.name}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((r) => (
                <tr key={r.label}>
                  <td className="px-4 py-2 font-medium text-slate-700">{r.label}</td>
                  <td className="px-4 py-2 text-slate-700">{r.a}</td>
                  <td className="px-4 py-2 text-slate-700">{r.b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2">
          <ProsConsBlock vendor={a} />
          <ProsConsBlock vendor={b} />
        </section>

        {cmp.verdictCopy ? (
          <section className="mt-10 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-3 text-lg font-semibold text-slate-900">Our verdict</h2>
            <Markdown>{cmp.verdictCopy}</Markdown>
          </section>
        ) : null}
      </div>
    </>
  );
}

function ComparisonHeader({ vendor }: { vendor: { slug: string; name: string; tagline: string | null; category: { slug: string }; ourScore: number | null } }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <Link href={`/${vendor.category.slug}/${vendor.slug}`} className="text-xl font-semibold text-slate-900 hover:underline">
        {vendor.name}
      </Link>
      {vendor.tagline ? <p className="mt-1 text-sm text-slate-600">{vendor.tagline}</p> : null}
      <div className="mt-3"><ScorePill score={vendor.ourScore} /></div>
    </div>
  );
}

function ProsConsBlock({ vendor }: { vendor: { name: string; pros: string[]; cons: string[] } }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h3 className="mb-3 text-base font-semibold text-slate-900">{vendor.name}</h3>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Pros</h4>
      <ul className="mb-4 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {vendor.pros.map((p) => <li key={p}>{p}</li>)}
      </ul>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cons</h4>
      <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
        {vendor.cons.map((c) => <li key={c}>{c}</li>)}
      </ul>
    </div>
  );
}
```

- [ ] **Step 2: Smoke test**

```bash
pnpm dev > /tmp/dev-m3-8.log 2>&1 &
DEV=$!
sleep 7
PORT=$(grep -oE "localhost:[0-9]+" /tmp/dev-m3-8.log | head -1 | cut -d: -f2)
PORT=${PORT:-3000}

curl -sS -o /tmp/vs.html -w "VS %{http_code}\n" "http://localhost:$PORT/compare/square-vs-stripe"
grep -oE "(Square|Stripe|Best for|Score|Pros|Cons|vs)" /tmp/vs.html | sort -u | head

curl -sS -o /dev/null -w "404 %{http_code}\n" "http://localhost:$PORT/compare/nonexistent-pair"

kill $DEV 2>/dev/null
wait 2>/dev/null
true
```

Expected: VS 200 with both vendor names + table markers, 404 for nonexistent pair.

- [ ] **Step 3: TS + commit**

```bash
pnpm tsc --noEmit
git add src/app/\(public\)/compare/
git commit -m "feat(m3): vs comparison page"
```

---

## Task 9: Buyer guide page

**Files:**
- Create: `src/app/(public)/[category]/buyers-guide/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { db } from "@/lib/db";
import { Markdown } from "@/lib/markdown";
import { PageHero } from "../../_components/PageHero";

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
```

- [ ] **Step 2: Smoke test all 6 buyer guides**

```bash
pnpm dev > /tmp/dev-m3-9.log 2>&1 &
DEV=$!
sleep 7
PORT=$(grep -oE "localhost:[0-9]+" /tmp/dev-m3-9.log | head -1 | cut -d: -f2)
PORT=${PORT:-3000}

for slug in debt-collection-software business-funding-software merchant-services pos-systems peo-services crm-software; do
  curl -sS -o /dev/null -w "$slug/buyers-guide: %{http_code}\n" "http://localhost:$PORT/$slug/buyers-guide"
done

kill $DEV 2>/dev/null
wait 2>/dev/null
true
```

Expected: each path 200.

- [ ] **Step 3: TS + commit**

```bash
pnpm tsc --noEmit
git add src/app/\(public\)/\[category\]/buyers-guide/
git commit -m "feat(m3): buyer guide page"
```

---

## Task 10: Wire `revalidatePath()` from admin to public routes

**Files:**
- Modify: `src/lib/revalidate.ts`, `src/app/admin/categories/actions.ts`, `src/app/admin/vendors/actions.ts`, `src/app/admin/comparisons/actions.ts`, `src/app/admin/buyer-guides/actions.ts`

- [ ] **Step 1: Update `src/lib/revalidate.ts`**

```typescript
import { revalidatePath } from "next/cache";

export function revalidateCategory(slug: string) {
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${slug}`);
  // Public routes
  revalidatePath("/");
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/best`);
  revalidatePath(`/${slug}/buyers-guide`);
}

export function revalidateVendor(categorySlug: string, vendorSlug: string) {
  revalidatePath("/admin/vendors");
  revalidatePath(`/admin/vendors/${vendorSlug}`);
  // Public routes
  revalidatePath("/");
  revalidatePath(`/${categorySlug}`);
  revalidatePath(`/${categorySlug}/best`);
  revalidatePath(`/${categorySlug}/${vendorSlug}`);
  revalidatePath(`/${categorySlug}/${vendorSlug}-alternatives`);
}

export function revalidateComparison(slug: string) {
  revalidatePath("/admin/comparisons");
  revalidatePath(`/admin/comparisons/${slug}`);
  // Public route
  revalidatePath(`/compare/${slug}`);
}

export function revalidateBuyerGuide(categorySlug: string, slug: string) {
  revalidatePath("/admin/buyer-guides");
  revalidatePath(`/admin/buyer-guides/${slug}`);
  // Public route
  revalidatePath(`/${categorySlug}/buyers-guide`);
}
```

- [ ] **Step 2: Add revalidate calls in vendors actions**

In `src/app/admin/vendors/actions.ts`, after each `db.vendor.create/update/delete`, fetch the category slug and call `revalidateVendor`. Update `createVendorAction`:

```typescript
import { revalidateVendor } from "@/lib/revalidate";

// Inside createVendorAction, replace the body to:
export async function createVendorAction(formData: FormData) {
  const parsed = createSchema.parse(fdToObj(formData));
  const slug = toSlug(parsed.name);
  const category = await db.category.findUnique({
    where: { id: parsed.categoryId },
    select: { slug: true },
  });
  await db.vendor.create({
    data: {
      slug,
      ...dataFromParsed(parsed),
    },
  });
  if (category) revalidateVendor(category.slug, slug);
  redirect(`/admin/vendors/${slug}`);
}
```

Apply the same pattern to `updateVendorAction` and `deleteVendorAction`. For delete, look up the vendor's category before deletion.

- [ ] **Step 3: Add revalidate calls in comparisons actions**

```typescript
import { revalidateComparison } from "@/lib/revalidate";
// Call revalidateComparison(slug) after each create/update
```

- [ ] **Step 4: Add revalidate calls in buyer-guides actions**

```typescript
import { revalidateBuyerGuide } from "@/lib/revalidate";
// Look up category slug, call revalidateBuyerGuide(categorySlug, slug)
```

- [ ] **Step 5: Run all tests**

```bash
pnpm test
```

Tests should still pass since `next/cache` is already mocked.

- [ ] **Step 6: TS + commit**

```bash
pnpm tsc --noEmit
git add src/lib/revalidate.ts src/app/admin/
git commit -m "feat(m3): wire revalidatePath from admin actions to public routes"
```

---

## Task 11: Schema.org JSON-LD on all public pages

**Files:**
- Create: `src/lib/schema-org.ts`
- Modify: `src/app/(public)/[category]/page.tsx`, `[category]/best/page.tsx`, `[category]/[vendor]/page.tsx`, `compare/[slug]/page.tsx`, `[category]/buyers-guide/page.tsx`

- [ ] **Step 1: Create JSON-LD helpers**

`src/lib/schema-org.ts`:

```typescript
const SITE_NAME = "The Hub";

export function categoryJsonLd(category: { slug: string; name: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: `/${category.slug}`,
  };
}

export function softwareApplicationJsonLd(vendor: {
  slug: string;
  name: string;
  websiteUrl: string;
  descriptionShort: string | null;
  ourScore: number | null;
  category: { slug: string; name: string };
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: vendor.name,
    applicationCategory: vendor.category.name,
    url: vendor.websiteUrl,
    description: vendor.descriptionShort ?? `${vendor.name} review on ${SITE_NAME}.`,
  };
  if (vendor.ourScore !== null) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: vendor.ourScore.toFixed(1),
      bestRating: "10",
      worstRating: "1",
      ratingCount: 1,
      author: { "@type": "Organization", name: SITE_NAME },
    };
  }
  return data;
}

export function articleJsonLd(args: { title: string; description: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.title,
    description: args.description,
    url: args.url,
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
```

The component is a Server Component so this works in `.ts`-only files only by re-exporting from a `.tsx`. Move the `JsonLd` export into `src/lib/schema-org.tsx` instead.

Adjusted: split into `src/lib/schema-org.tsx` (component) + the helpers can stay in either.

- [ ] **Step 2: Add JsonLd to category page**

In `src/app/(public)/[category]/page.tsx`, add:

```tsx
import { JsonLd, categoryJsonLd, faqJsonLd, breadcrumbJsonLd } from "@/lib/schema-org";

// At top of returned JSX (inside the fragment), add:
<JsonLd data={categoryJsonLd(category)} />
<JsonLd data={breadcrumbJsonLd([
  { name: "Home", url: "/" },
  { name: category.name, url: `/${category.slug}` },
])} />
<JsonLd data={faqJsonLd(faqs)} />
```

- [ ] **Step 3: Add JsonLd to vendor profile**

```tsx
<JsonLd data={softwareApplicationJsonLd(vendor)} />
<JsonLd data={breadcrumbJsonLd([
  { name: "Home", url: "/" },
  { name: vendor.category.name, url: `/${vendor.category.slug}` },
  { name: vendor.name, url: `/${vendor.category.slug}/${vendor.slug}` },
])} />
```

- [ ] **Step 4: Add JsonLd to comparison page**

```tsx
<JsonLd data={breadcrumbJsonLd([
  { name: "Home", url: "/" },
  { name: "Compare", url: "/compare" },
  { name: `${a.name} vs ${b.name}`, url: `/compare/${cmp.slug}` },
])} />
```

- [ ] **Step 5: Add JsonLd to buyer guide page**

```tsx
<JsonLd data={articleJsonLd({
  title: guide.title,
  description: `Buyer's guide for ${category.name.toLowerCase()}.`,
  url: `/${category.slug}/buyers-guide`,
})} />
```

- [ ] **Step 6: TS + smoke test (verify JSON-LD appears)**

```bash
pnpm tsc --noEmit
pnpm dev > /tmp/dev-m3-11.log 2>&1 &
DEV=$!
sleep 7
PORT=$(grep -oE "localhost:[0-9]+" /tmp/dev-m3-11.log | head -1 | cut -d: -f2)
PORT=${PORT:-3000}
curl -sS "http://localhost:$PORT/merchant-services/stripe" | grep -c "application/ld+json"
kill $DEV; wait; true
```

Expected: at least 2 JSON-LD blocks per page.

- [ ] **Step 7: Commit**

```bash
git add src/lib/schema-org.tsx src/app/\(public\)/
git commit -m "feat(m3): add schema.org JSON-LD on all public pages"
```

---

## Task 12: Sitemap + robots

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`

- [ ] **Step 1: Create `src/app/sitemap.ts`**

```typescript
import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE_URL = process.env.SITE_URL ?? "https://web-production-930b0.up.railway.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, vendors, comparisons, buyerGuides] = await Promise.all([
    db.category.findMany({ where: { isActive: true } }),
    db.vendor.findMany({ where: { status: "published" }, include: { category: true } }),
    db.comparison.findMany({ where: { isPublished: true } }),
    db.buyerGuide.findMany({ where: { isPublished: true }, include: { category: true } }),
  ]);

  const urls: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
  ];

  for (const c of categories) {
    urls.push({ url: `${BASE_URL}/${c.slug}`, changeFrequency: "weekly", priority: 0.9 });
    urls.push({ url: `${BASE_URL}/${c.slug}/best`, changeFrequency: "weekly", priority: 0.9 });
  }
  for (const v of vendors) {
    urls.push({ url: `${BASE_URL}/${v.category.slug}/${v.slug}`, changeFrequency: "weekly", priority: 0.8 });
    urls.push({ url: `${BASE_URL}/${v.category.slug}/${v.slug}-alternatives`, changeFrequency: "weekly", priority: 0.6 });
  }
  for (const cmp of comparisons) {
    urls.push({ url: `${BASE_URL}/compare/${cmp.slug}`, changeFrequency: "weekly", priority: 0.7 });
  }
  for (const g of buyerGuides) {
    urls.push({ url: `${BASE_URL}/${g.category.slug}/buyers-guide`, changeFrequency: "monthly", priority: 0.7 });
  }

  return urls;
}
```

- [ ] **Step 2: Create `src/app/robots.ts`**

```typescript
import type { MetadataRoute } from "next";

const BASE_URL = process.env.SITE_URL ?? "https://web-production-930b0.up.railway.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Smoke test**

```bash
pnpm dev > /tmp/dev-m3-12.log 2>&1 &
DEV=$!
sleep 7
PORT=$(grep -oE "localhost:[0-9]+" /tmp/dev-m3-12.log | head -1 | cut -d: -f2)
PORT=${PORT:-3000}
curl -sS "http://localhost:$PORT/sitemap.xml" | head -10
echo "---"
curl -sS "http://localhost:$PORT/robots.txt"
kill $DEV; wait; true
```

Expected: sitemap.xml lists /, all 6 categories, 30 vendors, 8 comparisons. robots.txt allows `/` and disallows `/admin/` + `/api/`.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat(m3): sitemap and robots"
```

---

## Task 13: Deploy and live smoke test

**Files:** none (operational task)

- [ ] **Step 1: Merge to main and push**

```bash
git checkout main
git merge --ff-only m3-public-pages
GH_TOKEN="..." git push "https://${GH_TOKEN}@github.com/barelezra10-create/B2bhub.git" HEAD:main
```

Use the same one-shot PAT pattern from M1/M2.

- [ ] **Step 2: Trigger Railway deploy**

```bash
railway up --ci
```

Build will run install, prisma generate, build. The migration step is preDeployCommand and runs against the existing DB (no schema changes in M3).

- [ ] **Step 3: Live smoke test on production URL**

```bash
URL="https://web-production-930b0.up.railway.app"
echo "Homepage:"
curl -sS -o /dev/null -w "%{http_code}\n" "$URL/"

echo "Category pages:"
for c in debt-collection-software business-funding-software merchant-services pos-systems peo-services crm-software; do
  curl -sS -o /dev/null -w "$c %{http_code}\n" "$URL/$c"
done

echo "Top-N pages:"
for c in debt-collection-software business-funding-software merchant-services pos-systems peo-services crm-software; do
  curl -sS -o /dev/null -w "$c/best %{http_code}\n" "$URL/$c/best"
done

echo "Vendor profiles (sample):"
for combo in "merchant-services/stripe" "crm-software/hubspot" "debt-collection-software/quantrax" "pos-systems/toast"; do
  curl -sS -o /dev/null -w "$combo %{http_code}\n" "$URL/$combo"
done

echo "Alternatives (sample):"
curl -sS -o /dev/null -w "stripe-alternatives %{http_code}\n" "$URL/merchant-services/stripe-alternatives"

echo "Comparisons (sample):"
for combo in "square-vs-stripe" "hubspot-vs-salesforce-sales-cloud"; do
  curl -sS -o /dev/null -w "$combo %{http_code}\n" "$URL/compare/$combo"
done

echo "Buyer guides (sample):"
curl -sS -o /dev/null -w "merchant-services/buyers-guide %{http_code}\n" "$URL/merchant-services/buyers-guide"

echo "Sitemap + robots:"
curl -sS -o /dev/null -w "sitemap.xml %{http_code}\n" "$URL/sitemap.xml"
curl -sS -o /dev/null -w "robots.txt %{http_code}\n" "$URL/robots.txt"
```

Expected: every URL returns 200. Total ~25 URLs.

- [ ] **Step 4: Update memory file with M3 completion**

Update `~/.claude/projects/-Users-baralezrah/memory/project_b2b_hub.md` to mark M3 as deployed.

---

## Self-Review

After M3 completes:

- [ ] Homepage shows 6 categories with vendor counts.
- [ ] Each `/[category]` page lists all 5 vendors + featured row + buyer guide CTA.
- [ ] Each `/[category]/best` page lists top 5 vendors with pros/cons + ranking explanation.
- [ ] Vendor profile pages show all sections (header, at-a-glance, description, features, pros/cons, competitors, FAQ).
- [ ] `/[category]/[vendor]-alternatives` works for every vendor.
- [ ] `/compare/[a-vs-b]` works for all 8 seeded comparisons.
- [ ] All 6 buyer guides render markdown.
- [ ] Sitemap lists 70+ URLs, robots.txt blocks /admin and /api.
- [ ] Schema.org JSON-LD appears on every page type.
- [ ] Admin edits to a vendor (test via admin UI) appear within 1 second on the public profile page.
- [ ] All 34+ unit tests still passing.
- [ ] Live deploy on Railway clears all 25 smoke-test URLs at 200.

---

## What's Next

M4 (Lead Capture + Email): adds the lead form component on vendor profiles + comparison pages, lead-capture API route, anti-spam (Cloudflare Turnstile, honeypot, rate limit, disposable-email blocklist), transactional email via Resend, lead inbox in admin.
