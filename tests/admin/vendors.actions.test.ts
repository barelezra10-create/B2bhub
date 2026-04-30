import { describe, it, expect, vi, beforeEach } from "vitest";
import { createVendorAction, updateVendorAction, deleteVendorAction } from "@/app/admin/vendors/actions";

vi.mock("@/lib/db", () => ({
  db: {
    vendor: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
    category: {
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { db } from "@/lib/db";

describe("createVendorAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a vendor with required fields and arrays parsed from comma-separated", async () => {
    vi.mocked(db.vendor.create).mockResolvedValueOnce({
      id: "v1",
      slug: "quantrax",
      name: "Quantrax",
      categoryId: "c1",
    } as never);

    const fd = new FormData();
    fd.set("name", "Quantrax");
    fd.set("websiteUrl", "https://quantrax.com");
    fd.set("categoryId", "c1");
    fd.set("pros", "Robust reporting\nGreat support");
    fd.set("cons", "Dated UI");
    fd.set("keyFeatures", "Reporting, Workflow");
    fd.set("integrations", "");
    fd.set("pricingModel", "quote");
    fd.set("bestForSegment", "all");
    fd.set("ourScore", "8");
    fd.set("sponsorTier", "none");
    fd.set("sponsorRankBoost", "0");
    fd.set("status", "draft");

    await expect(createVendorAction(fd)).rejects.toThrow(/REDIRECT:\/admin\/vendors\/quantrax/);

    expect(db.vendor.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Quantrax",
        slug: "quantrax",
        websiteUrl: "https://quantrax.com",
        categoryId: "c1",
        pros: ["Robust reporting", "Great support"],
        cons: ["Dated UI"],
        keyFeatures: ["Reporting", "Workflow"],
        integrations: [],
        ourScore: 8,
      }),
    });
  });

  it("rejects when websiteUrl is invalid", async () => {
    const fd = new FormData();
    fd.set("name", "X");
    fd.set("websiteUrl", "not-a-url");
    fd.set("categoryId", "c1");
    fd.set("pricingModel", "quote");
    fd.set("bestForSegment", "all");
    fd.set("sponsorTier", "none");
    fd.set("sponsorRankBoost", "0");
    fd.set("status", "draft");
    await expect(createVendorAction(fd)).rejects.toThrow();
    expect(db.vendor.create).not.toHaveBeenCalled();
  });
});

describe("updateVendorAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates by id and redirects to the new slug", async () => {
    vi.mocked(db.vendor.update).mockResolvedValueOnce({
      id: "v1",
      slug: "renamed",
      categoryId: "c1",
    } as never);

    const fd = new FormData();
    fd.set("id", "v1");
    fd.set("slug", "renamed");
    fd.set("name", "Renamed");
    fd.set("websiteUrl", "https://example.com");
    fd.set("categoryId", "c1");
    fd.set("pros", "");
    fd.set("cons", "");
    fd.set("keyFeatures", "");
    fd.set("integrations", "");
    fd.set("pricingModel", "paid");
    fd.set("bestForSegment", "smb");
    fd.set("sponsorTier", "none");
    fd.set("sponsorRankBoost", "0");
    fd.set("status", "published");

    await expect(updateVendorAction(fd)).rejects.toThrow(/REDIRECT:\/admin\/vendors\/renamed/);
    expect(db.vendor.update).toHaveBeenCalled();
  });
});

describe("deleteVendorAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes and redirects", async () => {
    vi.mocked(db.vendor.delete).mockResolvedValueOnce({ id: "v1" } as never);
    await expect(deleteVendorAction("v1")).rejects.toThrow("REDIRECT:/admin/vendors");
  });
});
