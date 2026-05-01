import { VendorLogo } from "./VendorLogo";

export function VendorMarquee({
  vendors,
  label = "We cover",
}: {
  vendors: { name: string; websiteUrl: string; logoUrl?: string | null }[];
  label?: string;
}) {
  if (vendors.length === 0) return null;
  const doubled = [...vendors, ...vendors];
  return (
    <section className="border-y border-[var(--border)] bg-[var(--bg-elev)]/60 py-5 overflow-hidden">
      <div className="container-x flex items-center gap-6">
        <span className="flex-shrink-0 font-mono text-[10px] uppercase tracking-[0.22em] text-[var(--accent)]">
          {label}
        </span>
        <div className="relative flex-1 overflow-hidden mask-fade">
          <div className="marquee flex w-max items-center gap-10">
            {doubled.map((v, i) => (
              <span
                key={`${v.name}-${i}`}
                className="flex flex-shrink-0 items-center gap-3 text-[var(--fg)]"
              >
                <VendorLogo vendor={v} size={28} rounded="sm" />
                <span className="font-display text-base font-semibold whitespace-nowrap">
                  {v.name}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
