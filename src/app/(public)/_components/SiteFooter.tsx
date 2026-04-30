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
