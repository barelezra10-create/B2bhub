import { describe, it, expect } from "vitest";
import { displayRank, pickTopN } from "@/lib/ranking";

describe("displayRank", () => {
  it("returns ourScore when not sponsored", () => {
    expect(displayRank({ ourScore: 8, sponsorTier: "none", sponsorRankBoost: 0 })).toBe(8);
  });

  it("adds sponsorRankBoost when sponsored", () => {
    expect(displayRank({ ourScore: 7, sponsorTier: "featured", sponsorRankBoost: 2 })).toBe(9);
  });

  it("treats null ourScore as 0", () => {
    expect(displayRank({ ourScore: null, sponsorTier: "none", sponsorRankBoost: 0 })).toBe(0);
  });

  it("clamps boost to max +2", () => {
    expect(displayRank({ ourScore: 5, sponsorTier: "premium", sponsorRankBoost: 5 })).toBe(7);
  });
});

describe("pickTopN", () => {
  const v = (slug: string, ourScore: number | null, boost = 0) => ({
    slug,
    ourScore,
    sponsorTier: boost > 0 ? "featured" : "none",
    sponsorRankBoost: boost,
  }) as const;

  it("returns top-N sorted by displayRank desc", () => {
    const result = pickTopN([
      v("a", 7),
      v("b", 9),
      v("c", 8),
    ], 2);
    expect(result.map((x) => x.slug)).toEqual(["b", "c"]);
  });

  it("excludes vendors with ourScore < 6", () => {
    const result = pickTopN([
      v("a", 5),
      v("b", 8),
      v("c", null),
    ], 5);
    expect(result.map((x) => x.slug)).toEqual(["b"]);
  });

  it("respects sponsor boost in ordering but never below ourScore 6", () => {
    const result = pickTopN([
      v("a", 5, 2),    // displayRank 7 but ourScore < 6 - excluded
      v("b", 6, 0),    // displayRank 6
      v("c", 7, 1),    // displayRank 8
    ], 5);
    expect(result.map((x) => x.slug)).toEqual(["c", "b"]);
  });
});
