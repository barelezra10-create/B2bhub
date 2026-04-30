import { db } from "@/lib/db";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { VendorForm } from "../_components/VendorForm";
import { createVendorAction } from "../actions";

export default async function NewVendorPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return (
    <div>
      <AdminPageHeader title="New vendor" />
      <VendorForm action={createVendorAction} categories={categories} submitLabel="Create vendor" />
    </div>
  );
}
