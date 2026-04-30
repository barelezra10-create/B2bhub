import Link from "next/link";
import { db } from "@/lib/db";
import { AdminPageHeader, AdminPrimaryLink } from "@/app/admin/_components/AdminPageHeader";
import { AdminTable } from "@/app/admin/_components/AdminTable";

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { vendors: true } } },
  });

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Top-level categories. Each has its own URL and hosts a vendor list, top-N, and buyer guide."
        actions={<AdminPrimaryLink href="/admin/categories/new">New category</AdminPrimaryLink>}
      />

      {categories.length === 0 ? (
        <AdminTable headers={["Name", "Slug", "Vendors", "Active"]} empty="No categories yet. Create the first one.">
          {null}
        </AdminTable>
      ) : (
        <AdminTable headers={["Name", "Slug", "Vendors", "Active"]}>
          {categories.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-2">
                <Link href={`/admin/categories/${c.slug}`} className="font-medium text-slate-900 hover:underline">
                  {c.name}
                </Link>
              </td>
              <td className="px-4 py-2 text-slate-600">/{c.slug}</td>
              <td className="px-4 py-2 text-slate-600">{c._count.vendors}</td>
              <td className="px-4 py-2 text-slate-600">{c.isActive ? "Yes" : "No"}</td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
