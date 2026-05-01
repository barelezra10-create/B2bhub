import Link from "next/link";
import { db } from "@/lib/db";

export async function SiteHeader() {
  let categories: { slug: string; name: string }[] = [];
  try {
    categories = await db.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { slug: true, name: true },
    });
  } catch {
    // DB unreachable at build; render an empty nav
  }

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur-md">
      <div className="container-x flex items-center justify-between gap-6 py-4">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="relative inline-flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)] text-white shadow-warm">
            <span className="font-display font-bold text-base leading-none">/</span>
          </span>
          <span className="font-display text-base font-bold tracking-tight text-[var(--fg)]">
            The Hub
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] font-medium text-[var(--fg-muted)] md:flex">
          {categories.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="link-underline hover:text-[var(--accent)]"
            >
              {c.name}
            </Link>
          ))}
          {categories.length > 5 ? (
            <Link
              href="/"
              className="text-[var(--fg-subtle)] hover:text-[var(--accent)]"
            >
              + {categories.length - 5} more
            </Link>
          ) : null}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/" className="btn-primary">
            Find software
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
