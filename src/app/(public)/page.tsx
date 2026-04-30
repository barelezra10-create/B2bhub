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
