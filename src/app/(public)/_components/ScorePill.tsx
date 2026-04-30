export function ScorePill({ score }: { score: number | null }) {
  if (score === null) return <span className="text-xs text-slate-400">No score</span>;
  const tone =
    score >= 9 ? "bg-emerald-100 text-emerald-900" :
    score >= 7 ? "bg-slate-900 text-white" :
    "bg-slate-200 text-slate-700";
  return (
    <span className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold ${tone}`}>
      {score.toFixed(1)} / 10
    </span>
  );
}
