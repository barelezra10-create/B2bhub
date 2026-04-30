import Link from "next/link";
import { db } from "@/lib/db";
import { AdminPageHeader, AdminPrimaryLink } from "@/app/admin/_components/AdminPageHeader";
import { AdminTable } from "@/app/admin/_components/AdminTable";

export default async function BuyerGuidesPage() {
  const guides = await db.buyerGuide.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <AdminPageHeader
        title="Buyer Guides"
        actions={<AdminPrimaryLink href="/admin/buyer-guides/new">New buyer guide</AdminPrimaryLink>}
      />
      {guides.length === 0 ? (
        <AdminTable headers={["Title", "Category", "Published"]} empty="No buyer guides yet.">
          {null}
        </AdminTable>
      ) : (
        <AdminTable headers={["Title", "Category", "Published"]}>
          {guides.map((g) => (
            <tr key={g.id}>
              <td className="px-4 py-2">
                <Link href={`/admin/buyer-guides/${g.slug}`} className="font-medium text-slate-900 hover:underline">
                  {g.title}
                </Link>
              </td>
              <td className="px-4 py-2 text-slate-600">{g.category.name}</td>
              <td className="px-4 py-2 text-slate-600">{g.isPublished ? "Yes" : "No"}</td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
