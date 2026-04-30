export function FaqList({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  if (items.length === 0) return null;
  return (
    <section className="mt-12">
      <h2 className="mb-4 text-xl font-semibold text-slate-900">FAQ</h2>
      <dl className="divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
        {items.map((item) => (
          <div key={item.q} className="p-5">
            <dt className="font-medium text-slate-900">{item.q}</dt>
            <dd className="mt-2 text-sm text-slate-600">{item.a}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
