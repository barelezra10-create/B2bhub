/**
 * Deterministic sub-score derivation. Each vendor gets 6 sub-scores
 * (0-10) derived from their existing data fields + a slug-hashed
 * variance so vendors with similar profiles get noticeably different
 * sub-score breakdowns.
 *
 * Sub-scores are recomputed at request time. They're stable per vendor
 * (same slug + data → same scores) so a refresh never changes them.
 */

export type SubScores = {
  easeOfUse: number;
  features: number;
  integrations: number;
  support: number;
  pricingTransparency: number;
  valueForMoney: number;
};

export const SUB_SCORE_LABELS: Record<keyof SubScores, string> = {
  easeOfUse: "Ease of use",
  features: "Features",
  integrations: "Integrations",
  support: "Support",
  pricingTransparency: "Pricing transparency",
  valueForMoney: "Value for money",
};

export const SUB_SCORE_KEYS: (keyof SubScores)[] = [
  "easeOfUse",
  "features",
  "integrations",
  "support",
  "pricingTransparency",
  "valueForMoney",
];

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

function clamp(n: number, min = 0, max = 10): number {
  return Math.min(max, Math.max(min, n));
}

export function computeSubScores(vendor: {
  slug: string;
  ourScore: number | null;
  pricingModel: string;
  pricingStartingAt: string | null;
  keyFeatures: string[];
  integrations: string[];
}): SubScores {
  const base = vendor.ourScore ?? 7;
  const seed = hashString(vendor.slug);

  // Returns a deterministic value in [-0.4, 0.4] for a given facet index
  const variance = (i: number): number => {
    const r = (seed + i * 31) % 9;
    return (r - 4) / 10; // -0.4 to 0.4
  };

  const featuresBoost = Math.min(vendor.keyFeatures.length / 5, 1) * 0.6;
  const integrationsBoost = Math.min(vendor.integrations.length / 5, 1) * 0.6;
  const pricingBoost =
    vendor.pricingModel === "free"
      ? 1.4
      : vendor.pricingModel === "freemium"
      ? 0.9
      : vendor.pricingModel === "paid"
      ? 0.2
      : -0.4;
  const transparencyBoost = vendor.pricingStartingAt ? 0.9 : -0.7;

  return {
    easeOfUse: clamp(base + variance(1)),
    features: clamp(base + variance(2) + featuresBoost),
    integrations: clamp(base + variance(3) + integrationsBoost),
    support: clamp(base + variance(4)),
    pricingTransparency: clamp(base + variance(5) + transparencyBoost),
    valueForMoney: clamp(base + variance(6) + pricingBoost),
  };
}
