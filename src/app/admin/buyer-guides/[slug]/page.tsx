import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { DeleteButton } from "@/app/admin/_components/DeleteButton";
import { BuyerGuideForm } from "../_components/BuyerGuideForm";
import { updateBuyerGuideAction, deleteBuyerGuideAction } from "../actions";

export default async function EditBuyerGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [guide, categories] = await Promise.all([
    db.buyerGuide.findUnique({ where: { slug }, include: { category: true } }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!guide) notFound();

  return (
    <div>
      <AdminPageHeader
        title={guide.title}
        description={`/${guide.category.slug}/buyers-guide`}
        actions={
          <DeleteButton
            confirmMessage={`Delete buyer guide "${guide.title}"?`}
            action={async () => {
              "use server";
              await deleteBuyerGuideAction(guide.id);
            }}
          />
        }
      />
      <BuyerGuideForm
        action={updateBuyerGuideAction}
        categories={categories}
        initial={{ ...guide }}
        submitLabel="Save changes"
      />
    </div>
  );
}
