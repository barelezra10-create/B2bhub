import { revalidatePath } from "next/cache";

// Reused by server actions when content changes.
// Expand in M3 once public pages exist; for now just admin pages get revalidated.

export function revalidateCategory(slug: string) {
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${slug}`);
  // M3: also revalidate `/${slug}`, `/${slug}/best`, etc.
}

export function revalidateVendor(categorySlug: string, vendorSlug: string) {
  revalidatePath("/admin/vendors");
  revalidatePath(`/admin/vendors/${vendorSlug}`);
  // M3: also revalidate `/${categorySlug}`, `/${categorySlug}/${vendorSlug}`, etc.
}

export function revalidateComparison(slug: string) {
  revalidatePath("/admin/comparisons");
  revalidatePath(`/admin/comparisons/${slug}`);
  // M3: also revalidate `/compare/${slug}`.
}

export function revalidateBuyerGuide(categorySlug: string, slug: string) {
  revalidatePath("/admin/buyer-guides");
  revalidatePath(`/admin/buyer-guides/${slug}`);
  // M3: also revalidate `/${categorySlug}/buyers-guide`.
}
