import { describe, it, expect, vi, beforeEach } from "vitest";
import { createComparisonAction, updateComparisonAction, deleteComparisonAction } from "@/app/admin/comparisons/actions";

vi.mock("@/lib/db", () => ({
  db: {
    comparison: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    vendor: { findMany: vi.fn() },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((u: string) => { throw new Error(`REDIRECT:${u}`); }),
}));

import { db } from "@/lib/db";

describe("createComparisonAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates with sorted vs slug", async () => {
    vi.mocked(db.vendor.findMany).mockResolvedValueOnce([
      { id: "vA", slug: "salesforce" },
      { id: "vB", slug: "hubspot" },
    ] as never);
    vi.mocked(db.comparison.create).mockResolvedValueOnce({ slug: "hubspot-vs-salesforce" } as never);

    const fd = new FormData();
    fd.set("vendorAId", "vA");
    fd.set("vendorBId", "vB");

    await expect(createComparisonAction(fd)).rejects.toThrow(
      "REDIRECT:/admin/comparisons/hubspot-vs-salesforce",
    );

    expect(db.comparison.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        slug: "hubspot-vs-salesforce",
        vendorAId: "vA",
        vendorBId: "vB",
        isPublished: false,
      }),
    });
  });

  it("rejects when both vendor ids match", async () => {
    const fd = new FormData();
    fd.set("vendorAId", "vA");
    fd.set("vendorBId", "vA");
    await expect(createComparisonAction(fd)).rejects.toThrow();
  });
});

describe("updateComparisonAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates copy fields", async () => {
    vi.mocked(db.comparison.update).mockResolvedValueOnce({ slug: "a-vs-b" } as never);
    const fd = new FormData();
    fd.set("id", "cmp1");
    fd.set("slug", "a-vs-b");
    fd.set("hookCopy", "hook");
    fd.set("summaryCopy", "summary");
    fd.set("verdictCopy", "verdict");
    fd.set("isPublished", "on");
    await expect(updateComparisonAction(fd)).rejects.toThrow("REDIRECT:/admin/comparisons/a-vs-b");
    expect(db.comparison.update).toHaveBeenCalled();
  });
});
