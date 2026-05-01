/**
 * Vendor logo URL helper. Uses Google's S2 favicon service
 * (https://www.google.com/s2/favicons?domain={host}&sz=256)
 * which returns a clean PNG for almost every public site.
 *
 * (Clearbit's free Logo API was retired in 2024 - their hostname
 * no longer resolves. Google's favicon service is the most reliable
 * always-on alternative.)
 *
 * If the vendor has an explicit logoUrl set in admin, prefer that.
 */
export function logoUrlFor(vendor: { websiteUrl: string; logoUrl?: string | null }): string | null {
  if (vendor.logoUrl) return vendor.logoUrl;
  try {
    const url = new URL(vendor.websiteUrl);
    const host = url.hostname.replace(/^www\./, "");
    if (!host || host === "localhost") return null;
    return `https://www.google.com/s2/favicons?domain=${host}&sz=256`;
  } catch {
    return null;
  }
}
