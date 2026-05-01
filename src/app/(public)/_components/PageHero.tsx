export function PageHero({
  eyebrow,
  title,
  description,
  meta,
  align = "left",
  variant = "default",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  meta?: React.ReactNode;
  align?: "left" | "center";
  variant?: "default" | "compact" | "ultra";
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";
  const titleSize =
    variant === "ultra"
      ? "text-5xl md:text-7xl"
      : variant === "compact"
      ? "text-3xl md:text-4xl"
      : "text-4xl md:text-5xl";

  return (
    <section className="relative border-b border-[var(--color-rule)] bg-[var(--color-cream)] paper-grain">
      <div className={`mx-auto max-w-6xl px-6 ${variant === "ultra" ? "py-20 md:py-28" : "py-12 md:py-16"}`}>
        <div className={`max-w-4xl ${alignClass}`}>
          {eyebrow ? (
            <p className="mb-4 inline-flex items-center gap-2 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-[var(--color-forest)]">
              <span className="inline-block h-px w-8 bg-[var(--color-forest)]" aria-hidden />
              {eyebrow}
            </p>
          ) : null}
          <h1
            className={`font-display font-semibold leading-[1.05] tracking-tight text-[var(--color-ink)] ${titleSize} fade-rise`}
            style={{ fontVariationSettings: "'opsz' 144, 'SOFT' 50" }}
          >
            {title}
          </h1>
          {description ? (
            <p
              className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-ink-soft)] fade-rise"
              style={{ animationDelay: "120ms" }}
            >
              {description}
            </p>
          ) : null}
          {meta ? (
            <div className="mt-8 fade-rise" style={{ animationDelay: "240ms" }}>
              {meta}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
