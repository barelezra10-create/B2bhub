import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { DeleteButton } from "@/app/admin/_components/DeleteButton";
import { CategoryForm } from "../_components/CategoryForm";
import { updateCategoryAction, deleteCategoryAction } from "../actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) notFound();

  return (
    <div>
      <AdminPageHeader
        title={category.name}
        description={`/${category.slug}`}
        actions={
          <DeleteButton
            confirmMessage={`Delete category "${category.name}"? This cannot be undone.`}
            action={async () => {
              "use server";
              await deleteCategoryAction(category.id);
            }}
          />
        }
      />
      <CategoryForm
        action={updateCategoryAction}
        initial={{ ...category, sortOrder: category.sortOrder }}
        submitLabel="Save changes"
      />
    </div>
  );
}
