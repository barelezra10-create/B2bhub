import Link from "next/link";
import { db } from "@/lib/db";
import { AdminPageHeader, AdminPrimaryLink } from "@/app/admin/_components/AdminPageHeader";
import { AdminTable } from "@/app/admin/_components/AdminTable";

export default async function ComparisonsPage() {
  const comparisons = await db.comparison.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: { vendorA: true, vendorB: true },
  });

  return (
    <div>
      <AdminPageHeader
        title="Comparisons"
        actions={<AdminPrimaryLink href="/admin/comparisons/new">New comparison</AdminPrimaryLink>}
      />
      {comparisons.length === 0 ? (
        <AdminTable headers={["Slug", "Vendor A", "Vendor B", "Published"]} empty="No comparisons yet.">
          {null}
        </AdminTable>
      ) : (
        <AdminTable headers={["Slug", "Vendor A", "Vendor B", "Published"]}>
          {comparisons.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-2">
                <Link href={`/admin/comparisons/${c.slug}`} className="font-medium text-slate-900 hover:underline">
                  {c.slug}
                </Link>
              </td>
              <td className="px-4 py-2 text-slate-600">{c.vendorA.name}</td>
              <td className="px-4 py-2 text-slate-600">{c.vendorB.name}</td>
              <td className="px-4 py-2 text-slate-600">{c.isPublished ? "Yes" : "No"}</td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
