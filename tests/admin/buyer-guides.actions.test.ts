import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBuyerGuideAction, updateBuyerGuideAction, deleteBuyerGuideAction } from "@/app/admin/buyer-guides/actions";

vi.mock("@/lib/db", () => ({
  db: {
    buyerGuide: { create: vi.fn(), update: vi.fn(), delete: vi.fn(), findUnique: vi.fn() },
    category: { findUnique: vi.fn() },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((u: string) => { throw new Error(`REDIRECT:${u}`); }),
}));

import { db } from "@/lib/db";

describe("createBuyerGuideAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates with category-derived slug", async () => {
    vi.mocked(db.buyerGuide.create).mockResolvedValueOnce({ slug: "debt-buyers-guide" } as never);

    const fd = new FormData();
    fd.set("title", "Debt buyers guide");
    fd.set("categoryId", "cat1");
    fd.set("bodyMarkdown", "# Hello");

    await expect(createBuyerGuideAction(fd)).rejects.toThrow(
      "REDIRECT:/admin/buyer-guides/debt-buyers-guide",
    );

    expect(db.buyerGuide.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        slug: "debt-buyers-guide",
        title: "Debt buyers guide",
        categoryId: "cat1",
        bodyMarkdown: "# Hello",
        isPublished: false,
      }),
    });
  });
});

describe("updateBuyerGuideAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates by id", async () => {
    vi.mocked(db.buyerGuide.update).mockResolvedValueOnce({ slug: "x" } as never);
    const fd = new FormData();
    fd.set("id", "g1");
    fd.set("slug", "x");
    fd.set("title", "X");
    fd.set("categoryId", "c1");
    fd.set("bodyMarkdown", "body");
    fd.set("isPublished", "on");
    await expect(updateBuyerGuideAction(fd)).rejects.toThrow("REDIRECT:/admin/buyer-guides/x");
  });
});
