import { db } from "@/lib/db";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { BuyerGuideForm } from "../_components/BuyerGuideForm";
import { createBuyerGuideAction } from "../actions";

export default async function NewBuyerGuidePage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return (
    <div>
      <AdminPageHeader title="New buyer guide" />
      <BuyerGuideForm action={createBuyerGuideAction} categories={categories} submitLabel="Create buyer guide" />
    </div>
  );
}
