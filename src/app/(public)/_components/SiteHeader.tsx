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
    <header className="border-b border-[var(--color-rule)] bg-[var(--color-cream)]">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-5">
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-display text-[1.45rem] font-semibold leading-none tracking-tight text-[var(--color-ink)]">
            The Hub
          </span>
          <span className="hidden h-2 w-2 rounded-full bg-[var(--color-gold)] group-hover:bg-[var(--color-forest)] transition-colors sm:inline-block" aria-hidden />
          <span className="hidden text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--color-ink-muted)] sm:inline">
            B2B software, honestly compared
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] font-medium text-[var(--color-ink-soft)] md:flex">
          {categories.slice(0, 5).map((c) => (
            <Link
              key={c.slug}
              href={`/${c.slug}`}
              className="link-underline hover:text-[var(--color-ink)]"
            >
              {c.name}
            </Link>
          ))}
          {categories.length > 5 ? (
            <Link href="/" className="text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]">
              + {categories.length - 5} more
            </Link>
          ) : null}
        </nav>
      </div>
      <div className="mx-auto max-w-6xl px-6">
        <div className="rule-double" aria-hidden />
      </div>
    </header>
  );
}
