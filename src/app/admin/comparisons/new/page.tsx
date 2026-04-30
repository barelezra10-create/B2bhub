import { db } from "@/lib/db";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { NewComparisonForm } from "../_components/ComparisonForm";
import { createComparisonAction } from "../actions";

export default async function NewComparisonPage() {
  const vendors = await db.vendor.findMany({
    where: { status: "published" },
    orderBy: { name: "asc" },
    include: { category: { select: { name: true } } },
  });

  return (
    <div>
      <AdminPageHeader
        title="New comparison"
        description="Pick two published vendors. The slug is auto-generated from their names (alphabetical)."
      />
      <NewComparisonForm action={createComparisonAction} vendors={vendors} />
    </div>
  );
}
