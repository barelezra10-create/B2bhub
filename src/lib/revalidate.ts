import { revalidatePath } from "next/cache";

export function revalidateCategory(slug: string) {
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${slug}`);
  // Public routes
  revalidatePath("/");
  revalidatePath(`/${slug}`);
  revalidatePath(`/${slug}/best`);
  revalidatePath(`/${slug}/buyers-guide`);
}

export function revalidateVendor(categorySlug: string, vendorSlug: string) {
  revalidatePath("/admin/vendors");
  revalidatePath(`/admin/vendors/${vendorSlug}`);
  // Public routes
  revalidatePath("/");
  revalidatePath(`/${categorySlug}`);
  revalidatePath(`/${categorySlug}/best`);
  revalidatePath(`/${categorySlug}/${vendorSlug}`);
  revalidatePath(`/${categorySlug}/${vendorSlug}-alternatives`);
}

export function revalidateComparison(slug: string) {
  revalidatePath("/admin/comparisons");
  revalidatePath(`/admin/comparisons/${slug}`);
  // Public route
  revalidatePath(`/compare/${slug}`);
}

export function revalidateBuyerGuide(categorySlug: string, slug: string) {
  revalidatePath("/admin/buyer-guides");
  revalidatePath(`/admin/buyer-guides/${slug}`);
  // Public route
  revalidatePath(`/${categorySlug}/buyers-guide`);
}
