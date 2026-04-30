import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { CategoryForm } from "../_components/CategoryForm";
import { createCategoryAction } from "../actions";

export default function NewCategoryPage() {
  return (
    <div>
      <AdminPageHeader title="New category" />
      <CategoryForm action={createCategoryAction} submitLabel="Create category" />
    </div>
  );
}
