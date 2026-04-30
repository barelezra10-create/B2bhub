type RankableVendor = {
  slug: string;
  ourScore: number | null;
  sponsorTier: string;
  sponsorRankBoost: number;
};

const MAX_BOOST = 2;
const MIN_TOP_N_SCORE = 6;

export function displayRank(v: Pick<RankableVendor, "ourScore" | "sponsorTier" | "sponsorRankBoost">): number {
  const score = v.ourScore ?? 0;
  if (v.sponsorTier === "none") return score;
  const boost = Math.min(v.sponsorRankBoost, MAX_BOOST);
  return score + boost;
}

export function pickTopN<V extends RankableVendor>(vendors: V[], n: number): V[] {
  return vendors
    .filter((v) => v.ourScore !== null && v.ourScore >= MIN_TOP_N_SCORE)
    .sort((a, b) => displayRank(b) - displayRank(a))
    .slice(0, n);
}
