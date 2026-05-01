export function PageHero({
  eyebrow,
  title,
  description,
  meta,
  variant = "default",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  meta?: React.ReactNode;
  variant?: "default" | "compact" | "ultra";
}) {
  const titleSize =
    variant === "ultra"
      ? "text-5xl md:text-7xl lg:text-[5.5rem]"
      : variant === "compact"
      ? "text-3xl md:text-4xl"
      : "text-4xl md:text-5xl lg:text-6xl";

  return (
    <section className="relative overflow-hidden border-b border-[var(--border)] bg-[var(--bg)] blobs">
      <div
        className={`relative container-x ${variant === "ultra" ? "py-20 md:py-28" : "py-14 md:py-20"}`}
      >
        <div className="max-w-4xl">
          {eyebrow ? <p className="eyebrow mb-6">{eyebrow}</p> : null}
          <h1
            className={`font-display font-bold leading-[0.95] tracking-tight text-[var(--fg)] ${titleSize} fade-rise`}
          >
            {title}
          </h1>
          {description ? (
            <p
              className="mt-6 max-w-2xl text-lg leading-relaxed text-[var(--fg-soft)] md:text-xl fade-rise"
              style={{ animationDelay: "120ms" }}
            >
              {description}
            </p>
          ) : null}
          {meta ? (
            <div className="mt-10 fade-rise" style={{ animationDelay: "240ms" }}>
              {meta}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
