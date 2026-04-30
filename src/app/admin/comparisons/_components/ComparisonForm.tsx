import { FormField } from "@/app/admin/_components/FormField";
import { FormSection } from "@/app/admin/_components/FormSection";
import { SubmitButton } from "@/app/admin/_components/SubmitButton";

export function ComparisonEditForm({
  action,
  initial,
}: {
  action: (fd: FormData) => Promise<void>;
  initial: {
    id: string;
    slug: string;
    hookCopy: string | null;
    summaryCopy: string | null;
    verdictCopy: string | null;
    isPublished: boolean;
  };
}) {
  return (
    <form action={action} className="space-y-6 max-w-3xl">
      <input type="hidden" name="id" defaultValue={initial.id} />
      <input type="hidden" name="slug" defaultValue={initial.slug} />
      <FormSection title="Copy">
        <FormField label="Hook copy" name="hookCopy" defaultValue={initial.hookCopy ?? ""} textarea rows={3} />
        <FormField label="Summary copy" name="summaryCopy" defaultValue={initial.summaryCopy ?? ""} textarea rows={6} />
        <FormField label="Verdict copy" name="verdictCopy" defaultValue={initial.verdictCopy ?? ""} textarea rows={4} />
      </FormSection>
      <FormSection title="Publish">
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="isPublished" defaultChecked={initial.isPublished} />
          Published (visible on public site once M3 ships)
        </label>
      </FormSection>
      <SubmitButton label="Save changes" />
    </form>
  );
}

export function NewComparisonForm({
  action,
  vendors,
}: {
  action: (fd: FormData) => Promise<void>;
  vendors: { id: string; name: string; category: { name: string } }[];
}) {
  return (
    <form action={action} className="space-y-4 max-w-2xl">
      <FormSection title="Pick two vendors">
        <label className="block">
          <span className="block text-sm font-medium text-slate-700">Vendor A</span>
          <select
            name="vendorAId"
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select...</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.category.name})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-slate-700">Vendor B</span>
          <select
            name="vendorBId"
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select...</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.category.name})
              </option>
            ))}
          </select>
        </label>
      </FormSection>
      <SubmitButton label="Create comparison" />
    </form>
  );
}
