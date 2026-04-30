import { FormField } from "@/app/admin/_components/FormField";
import { FormSection } from "@/app/admin/_components/FormSection";
import { SubmitButton } from "@/app/admin/_components/SubmitButton";

type CategoryFormValues = {
  id?: string;
  slug?: string;
  name?: string;
  description?: string;
  icon?: string | null;
  heroImage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export function CategoryForm({
  action,
  initial,
  submitLabel,
}: {
  action: (fd: FormData) => Promise<void>;
  initial?: CategoryFormValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-6 max-w-3xl">
      {initial?.id ? <input type="hidden" name="id" defaultValue={initial.id} /> : null}

      <FormSection title="Basics">
        <FormField label="Name" name="name" defaultValue={initial?.name} required />
        {initial?.slug ? (
          <FormField label="Slug" name="slug" defaultValue={initial.slug} required />
        ) : null}
        <FormField
          label="Description"
          name="description"
          defaultValue={initial?.description}
          required
          textarea
          rows={4}
        />
        <FormField label="Icon (emoji or short text)" name="icon" defaultValue={initial?.icon ?? ""} />
        <FormField label="Hero image URL" name="heroImage" defaultValue={initial?.heroImage ?? ""} />
      </FormSection>

      <FormSection title="SEO">
        <FormField label="SEO title" name="seoTitle" defaultValue={initial?.seoTitle ?? ""} />
        <FormField
          label="SEO description"
          name="seoDescription"
          defaultValue={initial?.seoDescription ?? ""}
          textarea
          rows={2}
        />
      </FormSection>

      <FormSection title="Ordering">
        <FormField
          label="Sort order"
          name="sortOrder"
          type="number"
          defaultValue={initial?.sortOrder ?? 0}
          helpText="Lower numbers show first."
        />
        {initial?.id ? (
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={initial?.isActive ?? true}
            />
            Active (visible on the public site)
          </label>
        ) : null}
      </FormSection>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
