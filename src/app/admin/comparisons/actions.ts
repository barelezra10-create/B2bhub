"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { vsSlug } from "@/lib/slug";

const createSchema = z.object({
  vendorAId: z.string().min(1),
  vendorBId: z.string().min(1),
});

const updateSchema = z.object({
  id: z.string().min(1),
  slug: z.string().min(1),
  hookCopy: z.string().optional(),
  summaryCopy: z.string().optional(),
  verdictCopy: z.string().optional(),
  isPublished: z.string().optional(),
});

function fdToObj(fd: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") obj[k] = v;
  return obj;
}

export async function createComparisonAction(formData: FormData) {
  const parsed = createSchema.parse(fdToObj(formData));
  if (parsed.vendorAId === parsed.vendorBId) {
    throw new Error("Vendor A and Vendor B must be different");
  }
  const vendors = await db.vendor.findMany({
    where: { id: { in: [parsed.vendorAId, parsed.vendorBId] } },
    select: { id: true, slug: true },
  });
  if (vendors.length !== 2) {
    throw new Error("Both vendors must exist");
  }
  const [vA, vB] = vendors;
  const slug = vsSlug(vA.slug, vB.slug);
  await db.comparison.create({
    data: {
      slug,
      vendorAId: parsed.vendorAId,
      vendorBId: parsed.vendorBId,
      isPublished: false,
    },
  });
  redirect(`/admin/comparisons/${slug}`);
}

export async function updateComparisonAction(formData: FormData) {
  const parsed = updateSchema.parse(fdToObj(formData));
  await db.comparison.update({
    where: { id: parsed.id },
    data: {
      hookCopy: parsed.hookCopy || null,
      summaryCopy: parsed.summaryCopy || null,
      verdictCopy: parsed.verdictCopy || null,
      isPublished: parsed.isPublished === "on",
    },
  });
  redirect(`/admin/comparisons/${parsed.slug}`);
}

export async function deleteComparisonAction(id: string) {
  await db.comparison.delete({ where: { id } });
  redirect("/admin/comparisons");
}
