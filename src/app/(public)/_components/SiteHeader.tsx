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
