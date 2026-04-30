import { describe, it, expect } from "vitest";
import { toSlug, vsSlug } from "@/lib/slug";

describe("toSlug", () => {
  it("lowercases and replaces spaces with dashes", () => {
    expect(toSlug("Debt Collection Software")).toBe("debt-collection-software");
  });

  it("strips non-alphanumeric except dashes", () => {
    expect(toSlug("Quantrax & Co.")).toBe("quantrax-co");
  });

  it("collapses multiple dashes", () => {
    expect(toSlug("foo  --  bar")).toBe("foo-bar");
  });

  it("trims leading/trailing dashes", () => {
    expect(toSlug("---hello---")).toBe("hello");
  });

  it("handles unicode by stripping it", () => {
    expect(toSlug("Café déjà vu")).toBe("caf-d-j-vu");
  });
});

describe("vsSlug", () => {
  it("joins two vendor slugs with -vs-", () => {
    expect(vsSlug("salesforce", "hubspot")).toBe("hubspot-vs-salesforce");
  });

  it("orders alphabetically so order-independent", () => {
    expect(vsSlug("hubspot", "salesforce")).toBe("hubspot-vs-salesforce");
    expect(vsSlug("salesforce", "hubspot")).toBe("hubspot-vs-salesforce");
  });
});
