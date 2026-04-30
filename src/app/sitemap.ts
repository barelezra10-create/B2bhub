import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE_URL = process.env.SITE_URL ?? "https://web-production-930b0.up.railway.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, vendors, comparisons, buyerGuides] = await Promise.all([
    db.category.findMany({ where: { isActive: true } }),
    db.vendor.findMany({ where: { status: "published" }, include: { category: true } }),
    db.comparison.findMany({ where: { isPublished: true } }),
    db.buyerGuide.findMany({ where: { isPublished: true }, include: { category: true } }),
  ]);

  const urls: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: "weekly", priority: 1 },
  ];

  for (const c of categories) {
    urls.push({ url: `${BASE_URL}/${c.slug}`, changeFrequency: "weekly", priority: 0.9 });
    urls.push({ url: `${BASE_URL}/${c.slug}/best`, changeFrequency: "weekly", priority: 0.9 });
  }
  for (const v of vendors) {
    urls.push({ url: `${BASE_URL}/${v.category.slug}/${v.slug}`, changeFrequency: "weekly", priority: 0.8 });
    urls.push({ url: `${BASE_URL}/${v.category.slug}/${v.slug}-alternatives`, changeFrequency: "weekly", priority: 0.6 });
  }
  for (const cmp of comparisons) {
    urls.push({ url: `${BASE_URL}/compare/${cmp.slug}`, changeFrequency: "weekly", priority: 0.7 });
  }
  for (const g of buyerGuides) {
    urls.push({ url: `${BASE_URL}/${g.category.slug}/buyers-guide`, changeFrequency: "monthly", priority: 0.7 });
  }

  return urls;
}
