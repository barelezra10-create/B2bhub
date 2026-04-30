import Link from "next/link";
import { db } from "@/lib/db";
import { AdminPageHeader, AdminPrimaryLink } from "@/app/admin/_components/AdminPageHeader";
import { AdminTable } from "@/app/admin/_components/AdminTable";

export default async function VendorsPage() {
  const vendors = await db.vendor.findMany({
    orderBy: [{ name: "asc" }],
    include: { category: true },
  });

  return (
    <div>
      <AdminPageHeader
        title="Vendors"
        actions={<AdminPrimaryLink href="/admin/vendors/new">New vendor</AdminPrimaryLink>}
      />
      {vendors.length === 0 ? (
        <AdminTable headers={["Name", "Category", "Status", "Score", "Sponsor"]} empty="No vendors yet.">
          {null}
        </AdminTable>
      ) : (
        <AdminTable headers={["Name", "Category", "Status", "Score", "Sponsor"]}>
          {vendors.map((v) => (
            <tr key={v.id}>
              <td className="px-4 py-2">
                <Link href={`/admin/vendors/${v.slug}`} className="font-medium text-slate-900 hover:underline">
                  {v.name}
                </Link>
              </td>
              <td className="px-4 py-2 text-slate-600">{v.category.name}</td>
              <td className="px-4 py-2 text-slate-600">{v.status}</td>
              <td className="px-4 py-2 text-slate-600">{v.ourScore ?? "-"}</td>
              <td className="px-4 py-2 text-slate-600">{v.sponsorTier}</td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
