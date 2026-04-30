import { FormField } from "@/app/admin/_components/FormField";
import { FormSection } from "@/app/admin/_components/FormSection";
import { SubmitButton } from "@/app/admin/_components/SubmitButton";

export function BuyerGuideForm({
  action,
  initial,
  categories,
  submitLabel,
}: {
  action: (fd: FormData) => Promise<void>;
  initial?: {
    id?: string;
    slug?: string;
    title?: string;
    categoryId?: string;
    bodyMarkdown?: string;
    isPublished?: boolean;
  };
  categories: { id: string; name: string }[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-6 max-w-3xl">
      {initial?.id ? <input type="hidden" name="id" defaultValue={initial.id} /> : null}
      {initial?.slug ? <input type="hidden" name="slug" defaultValue={initial.slug} /> : null}
      <FormSection title="Basics">
        <FormField label="Title" name="title" defaultValue={initial?.title} required />
        <label className="block">
          <span className="block text-sm font-medium text-slate-700">Category</span>
          <select
            name="categoryId"
            defaultValue={initial?.categoryId}
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </FormSection>
      <FormSection title="Body (markdown)">
        <FormField
          label="Markdown"
          name="bodyMarkdown"
          defaultValue={initial?.bodyMarkdown ?? ""}
          textarea
          rows={20}
          helpText="Plain markdown. Live preview lands in M3 alongside public rendering."
        />
      </FormSection>
      {initial?.id ? (
        <FormSection title="Publish">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={initial?.isPublished ?? false}
            />
            Published
          </label>
        </FormSection>
      ) : null}
      <SubmitButton label={submitLabel} />
    </form>
  );
}
