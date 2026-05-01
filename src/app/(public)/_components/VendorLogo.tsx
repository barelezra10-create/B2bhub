/* eslint-disable @next/next/no-img-element */
import { logoUrlFor } from "@/lib/logo";

export function VendorLogo({
  vendor,
  size = 56,
  rounded = "md",
  className = "",
}: {
  vendor: { name: string; websiteUrl: string; logoUrl?: string | null };
  size?: number;
  rounded?: "none" | "sm" | "md" | "lg" | "full";
  className?: string;
}) {
  const url = logoUrlFor(vendor);
  const radius =
    rounded === "none" ? "rounded-none" :
    rounded === "sm" ? "rounded-sm" :
    rounded === "md" ? "rounded-md" :
    rounded === "lg" ? "rounded-lg" :
    "rounded-full";

  // Fallback shows two-letter initials in a forest/cream box
  const initials = vendor.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

  if (!url) {
    return (
      <div
        className={`${radius} flex items-center justify-center bg-[var(--color-forest)] text-[var(--color-cream)] font-display font-semibold ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.35 }}
        aria-label={`${vendor.name} logo`}
      >
        {initials}
      </div>
    );
  }

  return (
    <span
      className={`relative inline-flex items-center justify-center bg-[var(--color-cream-soft)] ${radius} overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={url}
        alt={`${vendor.name} logo`}
        width={size}
        height={size}
        loading="lazy"
        className="h-full w-full object-contain"
      />
    </span>
  );
}
