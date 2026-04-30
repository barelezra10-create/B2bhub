import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { DeleteButton } from "@/app/admin/_components/DeleteButton";
import { VendorForm } from "../_components/VendorForm";
import { updateVendorAction, deleteVendorAction } from "../actions";

export default async function EditVendorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [vendor, categories] = await Promise.all([
    db.vendor.findUnique({ where: { slug }, include: { category: true } }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!vendor) notFound();

  return (
    <div>
      <AdminPageHeader
        title={vendor.name}
        description={`/${vendor.category.slug}/${vendor.slug}`}
        actions={
          <DeleteButton
            confirmMessage={`Delete vendor "${vendor.name}"? This cannot be undone.`}
            action={async () => {
              "use server";
              await deleteVendorAction(vendor.id);
            }}
          />
        }
      />
      <VendorForm
        action={updateVendorAction}
        categories={categories}
        initial={{ ...vendor }}
        submitLabel="Save changes"
      />
    </div>
  );
}
