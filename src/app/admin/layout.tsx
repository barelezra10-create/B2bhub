import Link from "next/link";
import { getSession } from "@/lib/auth";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/vendors", label: "Vendors" },
  { href: "/admin/comparisons", label: "Comparisons" },
  { href: "/admin/buyer-guides", label: "Buyer Guides" },
  { href: "/admin/leads", label: "Leads" },
  { href: "/admin/sponsorships", label: "Sponsorships" },
  { href: "/admin/queue", label: "Content Queue" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  // Login page renders without the shell - it has its own layout
  if (!session.userId) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-56 bg-white border-r border-slate-200 p-4">
        <div className="text-sm font-semibold text-slate-900 mb-4">
          The Hub Admin
        </div>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block px-2 py-1 text-sm text-slate-700 rounded hover:bg-slate-100"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <form action="/api/auth/logout" method="POST" className="mt-6">
          <button
            type="submit"
            className="text-xs text-slate-500 hover:text-slate-900"
          >
            Sign out
          </button>
        </form>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
