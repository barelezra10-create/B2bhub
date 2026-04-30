export function PageHero({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10">
        {eyebrow ? <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{eyebrow}</p> : null}
        <h1 className="text-3xl font-semibold text-slate-900 md:text-4xl">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-base text-slate-600">{description}</p> : null}
      </div>
    </section>
  );
}
