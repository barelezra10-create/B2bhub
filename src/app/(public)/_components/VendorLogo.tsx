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
    rounded === "sm" ? "rounded" :
    rounded === "md" ? "rounded-lg" :
    rounded === "lg" ? "rounded-xl" :
    "rounded-full";

  // Two-letter initials fallback
  const initials = vendor.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "?";

  if (!url) {
    return (
      <div
        className={`${radius} flex items-center justify-center bg-[var(--bg-elev-2)] text-[var(--accent)] font-display font-bold border border-[var(--border)] ${className}`}
        style={{ width: size, height: size, fontSize: size * 0.36 }}
        aria-label={`${vendor.name} logo`}
      >
        {initials}
      </div>
    );
  }

  return (
    <span
      className={`relative inline-flex flex-shrink-0 items-center justify-center ${radius} bg-white border border-[var(--border)] overflow-hidden ${className}`}
      style={{ width: size, height: size, padding: Math.round(size * 0.12) }}
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
