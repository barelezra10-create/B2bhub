const SITE_NAME = "The Hub";

export function categoryJsonLd(category: { slug: string; name: string; description: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: `/${category.slug}`,
  };
}

export function softwareApplicationJsonLd(vendor: {
  slug: string;
  name: string;
  websiteUrl: string;
  descriptionShort: string | null;
  ourScore: number | null;
  category: { slug: string; name: string };
}) {
  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: vendor.name,
    applicationCategory: vendor.category.name,
    url: vendor.websiteUrl,
    description: vendor.descriptionShort ?? `${vendor.name} review on ${SITE_NAME}.`,
  };
  if (vendor.ourScore !== null) {
    data.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: vendor.ourScore.toFixed(1),
      bestRating: "10",
      worstRating: "1",
      ratingCount: 1,
      author: { "@type": "Organization", name: SITE_NAME },
    };
  }
  return data;
}

export function articleJsonLd(args: { title: string; description: string; url: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: args.title,
    description: args.description,
    url: args.url,
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export function faqJsonLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function itemListJsonLd(args: {
  name: string;
  vendors: { name: string; slug: string; categorySlug: string; ourScore: number | null }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: args.name,
    itemListElement: args.vendors.map((v, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `/${v.categorySlug}/${v.slug}`,
      name: v.name,
    })),
  };
}

export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
