import { FormField } from "@/app/admin/_components/FormField";
import { FormSection } from "@/app/admin/_components/FormSection";
import { SubmitButton } from "@/app/admin/_components/SubmitButton";

type VendorFormValues = {
  id?: string;
  slug?: string;
  name?: string;
  websiteUrl?: string;
  logoUrl?: string | null;
  tagline?: string | null;
  descriptionShort?: string | null;
  descriptionLong?: string | null;
  categoryId?: string;
  foundedYear?: number | null;
  hqLocation?: string | null;
  employeeCountRange?: string | null;
  pricingModel?: string;
  pricingStartingAt?: string | null;
  pricingNotes?: string | null;
  bestForSegment?: string;
  ourScore?: number | null;
  ourScoreNotes?: string | null;
  pros?: string[];
  cons?: string[];
  keyFeatures?: string[];
  integrations?: string[];
  isPaidSponsor?: boolean;
  sponsorTier?: string;
  sponsorRankBoost?: number;
  leadFormEnabled?: boolean;
  leadDestination?: string | null;
  affiliateUrl?: string | null;
  status?: string;
};

const PRICING_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Paid" },
  { value: "quote", label: "Quote / Custom" },
];

const SEGMENT_OPTIONS = [
  { value: "smb", label: "SMB" },
  { value: "mid_market", label: "Mid-market" },
  { value: "enterprise", label: "Enterprise" },
  { value: "all", label: "All sizes" },
];

const SPONSOR_OPTIONS = [
  { value: "none", label: "None" },
  { value: "featured", label: "Featured" },
  { value: "premium", label: "Premium" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

function Select({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function VendorForm({
  action,
  initial,
  categories,
  submitLabel,
}: {
  action: (fd: FormData) => Promise<void>;
  initial?: VendorFormValues;
  categories: { id: string; name: string }[];
  submitLabel: string;
}) {
  const listToTextarea = (xs?: string[]) => (xs ?? []).join("\n");

  return (
    <form action={action} className="space-y-6 max-w-3xl">
      {initial?.id ? <input type="hidden" name="id" defaultValue={initial.id} /> : null}

      <FormSection title="Basics">
        <FormField label="Name" name="name" defaultValue={initial?.name} required />
        {initial?.slug ? (
          <FormField label="Slug" name="slug" defaultValue={initial.slug} required />
        ) : null}
        <FormField label="Website URL" name="websiteUrl" defaultValue={initial?.websiteUrl} required />
        <FormField label="Logo URL" name="logoUrl" defaultValue={initial?.logoUrl ?? ""} />
        <FormField label="Tagline" name="tagline" defaultValue={initial?.tagline ?? ""} />
        <Select
          label="Category"
          name="categoryId"
          defaultValue={initial?.categoryId}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />
        <FormField
          label="Short description (1-2 sentences)"
          name="descriptionShort"
          defaultValue={initial?.descriptionShort ?? ""}
          textarea
          rows={2}
        />
        <FormField
          label="Long description (markdown)"
          name="descriptionLong"
          defaultValue={initial?.descriptionLong ?? ""}
          textarea
          rows={8}
        />
      </FormSection>

      <FormSection title="Company">
        <FormField label="Founded year" name="foundedYear" type="number" defaultValue={initial?.foundedYear ?? ""} />
        <FormField label="HQ location" name="hqLocation" defaultValue={initial?.hqLocation ?? ""} />
        <FormField label="Employee count range" name="employeeCountRange" defaultValue={initial?.employeeCountRange ?? ""} placeholder="50-200" />
      </FormSection>

      <FormSection title="Pricing">
        <Select label="Pricing model" name="pricingModel" defaultValue={initial?.pricingModel ?? "quote"} options={PRICING_OPTIONS} />
        <FormField label="Starting at" name="pricingStartingAt" defaultValue={initial?.pricingStartingAt ?? ""} placeholder="$99/mo" />
        <FormField
          label="Pricing notes"
          name="pricingNotes"
          defaultValue={initial?.pricingNotes ?? ""}
          textarea
          rows={3}
        />
      </FormSection>

      <FormSection title="Editorial">
        <Select label="Best for" name="bestForSegment" defaultValue={initial?.bestForSegment ?? "all"} options={SEGMENT_OPTIONS} />
        <FormField label="Our score (1-10)" name="ourScore" type="number" defaultValue={initial?.ourScore ?? ""} />
        <FormField
          label="Score notes"
          name="ourScoreNotes"
          defaultValue={initial?.ourScoreNotes ?? ""}
          textarea
          rows={3}
        />
        <FormField
          label="Pros (one per line)"
          name="pros"
          defaultValue={listToTextarea(initial?.pros)}
          textarea
          rows={4}
        />
        <FormField
          label="Cons (one per line)"
          name="cons"
          defaultValue={listToTextarea(initial?.cons)}
          textarea
          rows={4}
        />
        <FormField
          label="Key features (one per line)"
          name="keyFeatures"
          defaultValue={listToTextarea(initial?.keyFeatures)}
          textarea
          rows={5}
        />
        <FormField
          label="Integrations (one per line)"
          name="integrations"
          defaultValue={listToTextarea(initial?.integrations)}
          textarea
          rows={4}
        />
      </FormSection>

      <FormSection title="Sponsorship & Lead routing">
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="isPaidSponsor" defaultChecked={initial?.isPaidSponsor ?? false} />
          Paid sponsor
        </label>
        <Select label="Sponsor tier" name="sponsorTier" defaultValue={initial?.sponsorTier ?? "none"} options={SPONSOR_OPTIONS} />
        <FormField
          label="Sponsor rank boost (0-2)"
          name="sponsorRankBoost"
          type="number"
          defaultValue={initial?.sponsorRankBoost ?? 0}
        />
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="leadFormEnabled" defaultChecked={initial?.leadFormEnabled ?? true} />
          Lead form enabled on this vendor profile
        </label>
        <FormField label="Lead destination (email or webhook)" name="leadDestination" defaultValue={initial?.leadDestination ?? ""} />
        <FormField label="Affiliate URL (alternative to lead form)" name="affiliateUrl" defaultValue={initial?.affiliateUrl ?? ""} />
      </FormSection>

      <FormSection title="Publish">
        <Select label="Status" name="status" defaultValue={initial?.status ?? "draft"} options={STATUS_OPTIONS} />
      </FormSection>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
