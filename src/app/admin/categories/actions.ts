"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { toSlug } from "@/lib/slug";
import { revalidateCategory } from "@/lib/revalidate";

const baseSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().min(1),
  icon: z.string().optional(),
  heroImage: z.url().optional().or(z.literal("")),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.string().optional(),
});

const createSchema = baseSchema;
const updateSchema = baseSchema.extend({
  id: z.string().min(1),
  slug: z.string().min(1).max(120),
});

function fdToObj(fd: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [k, v] of fd.entries()) {
    if (typeof v === "string") obj[k] = v;
  }
  return obj;
}

export async function createCategoryAction(formData: FormData) {
  const parsed = createSchema.parse(fdToObj(formData));
  const slug = toSlug(parsed.name);
  await db.category.create({
    data: {
      slug,
      name: parsed.name,
      description: parsed.description,
      icon: parsed.icon || null,
      heroImage: parsed.heroImage || null,
      seoTitle: parsed.seoTitle || null,
      seoDescription: parsed.seoDescription || null,
      sortOrder: parsed.sortOrder,
      isActive: true,
    },
  });
  revalidateCategory(slug);
  redirect(`/admin/categories/${slug}`);
}

export async function updateCategoryAction(formData: FormData) {
  const parsed = updateSchema.parse(fdToObj(formData));
  await db.category.update({
    where: { id: parsed.id },
    data: {
      slug: parsed.slug,
      name: parsed.name,
      description: parsed.description,
      icon: parsed.icon || null,
      heroImage: parsed.heroImage || null,
      seoTitle: parsed.seoTitle || null,
      seoDescription: parsed.seoDescription || null,
      sortOrder: parsed.sortOrder,
      isActive: parsed.isActive === "on",
    },
  });
  revalidateCategory(parsed.slug);
  redirect(`/admin/categories/${parsed.slug}`);
}

export async function deleteCategoryAction(id: string) {
  await db.category.delete({ where: { id } });
  redirect("/admin/categories");
}
