/**
 * Vendor logo URL helper. Uses Clearbit's free Logo API
 * (https://logo.clearbit.com/{domain}) which serves a clean
 * square logo for almost every B2B vendor with a public site.
 *
 * If the vendor has an explicit logoUrl set in admin, prefer that.
 */
export function logoUrlFor(vendor: { websiteUrl: string; logoUrl?: string | null }): string | null {
  if (vendor.logoUrl) return vendor.logoUrl;
  try {
    const url = new URL(vendor.websiteUrl);
    const host = url.hostname.replace(/^www\./, "");
    if (!host || host === "localhost") return null;
    return `https://logo.clearbit.com/${host}`;
  } catch {
    return null;
  }
}
