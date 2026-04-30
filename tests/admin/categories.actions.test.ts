import { describe, it, expect, vi, beforeEach } from "vitest";
import { createCategoryAction, updateCategoryAction, deleteCategoryAction } from "@/app/admin/categories/actions";

vi.mock("@/lib/db", () => ({
  db: {
    category: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { db } from "@/lib/db";

describe("createCategoryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a category from valid form data and redirects", async () => {
    vi.mocked(db.category.create).mockResolvedValueOnce({
      id: "c1",
      slug: "debt-collection-software",
      name: "Debt Collection Software",
    } as never);

    const fd = new FormData();
    fd.set("name", "Debt Collection Software");
    fd.set("description", "Software for collection agencies");
    fd.set("sortOrder", "10");

    await expect(createCategoryAction(fd)).rejects.toThrow(
      "REDIRECT:/admin/categories/debt-collection-software",
    );

    expect(db.category.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Debt Collection Software",
        slug: "debt-collection-software",
        description: "Software for collection agencies",
        sortOrder: 10,
        isActive: true,
      }),
    });
  });

  it("rejects when name is missing", async () => {
    const fd = new FormData();
    fd.set("description", "x");
    await expect(createCategoryAction(fd)).rejects.toThrow();
    expect(db.category.create).not.toHaveBeenCalled();
  });
});

describe("updateCategoryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates by id and revalidates", async () => {
    vi.mocked(db.category.update).mockResolvedValueOnce({
      id: "c1",
      slug: "x",
      name: "X",
    } as never);

    const fd = new FormData();
    fd.set("id", "c1");
    fd.set("name", "Updated");
    fd.set("description", "d");
    fd.set("slug", "updated");
    fd.set("sortOrder", "0");
    fd.set("isActive", "on");

    await expect(updateCategoryAction(fd)).rejects.toThrow(
      "REDIRECT:/admin/categories/updated",
    );

    expect(db.category.update).toHaveBeenCalledWith({
      where: { id: "c1" },
      data: expect.objectContaining({ name: "Updated", slug: "updated", isActive: true }),
    });
  });
});

describe("deleteCategoryAction", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes and redirects to list", async () => {
    vi.mocked(db.category.delete).mockResolvedValueOnce({ id: "c1" } as never);
    await expect(deleteCategoryAction("c1")).rejects.toThrow(
      "REDIRECT:/admin/categories",
    );
    expect(db.category.delete).toHaveBeenCalledWith({ where: { id: "c1" } });
  });
});
