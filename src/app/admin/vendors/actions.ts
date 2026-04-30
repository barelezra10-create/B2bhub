"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { toSlug } from "@/lib/slug";

const PRICING = ["free", "freemium", "paid", "quote"] as const;
const SEGMENT = ["smb", "mid_market", "enterprise", "all"] as const;
const SPONSOR_TIER = ["none", "featured", "premium"] as const;
const VENDOR_STATUS = ["draft", "published"] as const;

const baseSchema = z.object({
  name: z.string().min(1).max(160),
  websiteUrl: z.url(),
  categoryId: z.string().min(1),
  logoUrl: z.string().optional(),
  tagline: z.string().optional(),
  descriptionShort: z.string().optional(),
  descriptionLong: z.string().optional(),
  foundedYear: z.coerce.number().int().optional().or(z.literal("")),
  hqLocation: z.string().optional(),
  employeeCountRange: z.string().optional(),
  pricingModel: z.enum(PRICING),
  pricingStartingAt: z.string().optional(),
  pricingNotes: z.string().optional(),
  bestForSegment: z.enum(SEGMENT),
  ourScore: z.coerce.number().int().min(0).max(10).optional().or(z.literal("")),
  ourScoreNotes: z.string().optional(),
  pros: z.string().optional().default(""),
  cons: z.string().optional().default(""),
  keyFeatures: z.string().optional().default(""),
  integrations: z.string().optional().default(""),
  isPaidSponsor: z.string().optional(),
  sponsorTier: z.enum(SPONSOR_TIER),
  sponsorRankBoost: z.coerce.number().int().min(0).max(2).default(0),
  leadFormEnabled: z.string().optional(),
  leadDestination: z.string().optional(),
  affiliateUrl: z.string().optional(),
  status: z.enum(VENDOR_STATUS),
});

const createSchema = baseSchema;
const updateSchema = baseSchema.extend({
  id: z.string().min(1),
  slug: z.string().min(1).max(160),
});

function fdToObj(fd: FormData): Record<string, string> {
  const obj: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") obj[k] = v;
  return obj;
}

function parseList(input: string | undefined): string[] {
  if (!input) return [];
  return input
    .split(/[,\n]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function dataFromParsed(p: z.infer<typeof baseSchema>) {
  return {
    name: p.name,
    websiteUrl: p.websiteUrl,
    categoryId: p.categoryId,
    logoUrl: p.logoUrl || null,
    tagline: p.tagline || null,
    descriptionShort: p.descriptionShort || null,
    descriptionLong: p.descriptionLong || null,
    foundedYear: typeof p.foundedYear === "number" ? p.foundedYear : null,
    hqLocation: p.hqLocation || null,
    employeeCountRange: p.employeeCountRange || null,
    pricingModel: p.pricingModel,
    pricingStartingAt: p.pricingStartingAt || null,
    pricingNotes: p.pricingNotes || null,
    bestForSegment: p.bestForSegment,
    ourScore: typeof p.ourScore === "number" ? p.ourScore : null,
    ourScoreNotes: p.ourScoreNotes || null,
    pros: parseList(p.pros),
    cons: parseList(p.cons),
    keyFeatures: parseList(p.keyFeatures),
    integrations: parseList(p.integrations),
    isPaidSponsor: p.isPaidSponsor === "on",
    sponsorTier: p.sponsorTier,
    sponsorRankBoost: p.sponsorRankBoost,
    leadFormEnabled: p.leadFormEnabled === "on",
    leadDestination: p.leadDestination || null,
    affiliateUrl: p.affiliateUrl || null,
    status: p.status,
  };
}

export async function createVendorAction(formData: FormData) {
  const parsed = createSchema.parse(fdToObj(formData));
  const slug = toSlug(parsed.name);
  await db.vendor.create({
    data: {
      slug,
      ...dataFromParsed(parsed),
    },
  });
  redirect(`/admin/vendors/${slug}`);
}

export async function updateVendorAction(formData: FormData) {
  const parsed = updateSchema.parse(fdToObj(formData));
  await db.vendor.update({
    where: { id: parsed.id },
    data: {
      slug: parsed.slug,
      ...dataFromParsed(parsed),
    },
  });
  redirect(`/admin/vendors/${parsed.slug}`);
}

export async function deleteVendorAction(id: string) {
  await db.vendor.delete({ where: { id } });
  redirect("/admin/vendors");
}
