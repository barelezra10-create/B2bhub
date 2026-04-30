"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { toSlug } from "@/lib/slug";

const baseSchema = z.object({
  title: z.string().min(1).max(200),
  categoryId: z.string().min(1),
  bodyMarkdown: z.string().min(1),
  isPublished: z.string().optional(),
});

const createSchema = baseSchema;
const updateSchema = baseSchema.extend({
  id: z.string().min(1),
  slug: z.string().min(1),
});

function fdToObj(fd: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") obj[k] = v;
  return obj;
}

export async function createBuyerGuideAction(formData: FormData) {
  const parsed = createSchema.parse(fdToObj(formData));
  const slug = toSlug(parsed.title);
  await db.buyerGuide.create({
    data: {
      slug,
      title: parsed.title,
      categoryId: parsed.categoryId,
      bodyMarkdown: parsed.bodyMarkdown,
      isPublished: false,
    },
  });
  redirect(`/admin/buyer-guides/${slug}`);
}

export async function updateBuyerGuideAction(formData: FormData) {
  const parsed = updateSchema.parse(fdToObj(formData));
  await db.buyerGuide.update({
    where: { id: parsed.id },
    data: {
      slug: parsed.slug,
      title: parsed.title,
      categoryId: parsed.categoryId,
      bodyMarkdown: parsed.bodyMarkdown,
      isPublished: parsed.isPublished === "on",
    },
  });
  redirect(`/admin/buyer-guides/${parsed.slug}`);
}

export async function deleteBuyerGuideAction(id: string) {
  await db.buyerGuide.delete({ where: { id } });
  redirect("/admin/buyer-guides");
}
