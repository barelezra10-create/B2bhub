/**
 * Seed launch data: 6 categories, 30 vendors (5 per category),
 * 6 buyer guides (1 per category), and a handful of comparisons.
 *
 * Idempotent: uses upsert by slug, so re-running updates existing rows.
 *
 * Usage:
 *   pnpm tsx scripts/seed-launch-data.ts
 */

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { config } from "dotenv";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL not set");

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

type CategorySeed = {
  slug: string;
  name: string;
  description: string;
  seoTitle: string;
  seoDescription: string;
  sortOrder: number;
};

const categories: CategorySeed[] = [
  {
    slug: "debt-collection-software",
    name: "Debt Collection Software",
    description:
      "Software for collection agencies, debt buyers, and law firms. Compares core platforms covering account management, omni-channel contact, payment processing, compliance reporting, and analytics.",
    seoTitle: "Best Debt Collection Software (2026): Compare 25+ Platforms",
    seoDescription:
      "Compare the leading debt collection software platforms used by agencies and law firms. Editorial scores, real pros and cons, and side-by-side comparisons.",
    sortOrder: 10,
  },
  {
    slug: "business-funding-software",
    name: "Business Funding Software",
    description:
      "CRMs, lead-management systems, underwriting platforms, and syndication tools built for the merchant cash advance (MCA), small-business lending, and alternative-finance industry.",
    seoTitle: "Best MCA / Business Funding Software (2026)",
    seoDescription:
      "Compare CRMs and underwriting platforms for MCA and alternative business lending. Built for brokers, ISOs, and direct funders.",
    sortOrder: 20,
  },
  {
    slug: "merchant-services",
    name: "Merchant Services",
    description:
      "Payment processing, card-acquiring, and merchant-account providers for SMBs and enterprises. Compare rates, integrations, and the trade-offs between flat-rate, interchange-plus, and tiered pricing.",
    seoTitle: "Best Merchant Services Providers for SMBs (2026)",
    seoDescription:
      "Compare merchant services providers on pricing model, integrations, and underwriting. Honest reviews of the top processors for SMB and ecommerce.",
    sortOrder: 30,
  },
  {
    slug: "pos-systems",
    name: "POS Systems",
    description:
      "Point-of-sale platforms for retail, restaurants, and hybrid businesses. Compare hardware, software, payments integration, and inventory management across the leading systems.",
    seoTitle: "Best POS Systems for Small Business (2026)",
    seoDescription:
      "Compare POS systems on hardware, transaction fees, integrations, and industry fit. Find the right system for retail, restaurant, or service business.",
    sortOrder: 40,
  },
  {
    slug: "peo-services",
    name: "PEO Services",
    description:
      "Professional employer organizations that handle payroll, benefits, HR, and compliance for SMBs. Compare large national PEOs and specialized providers across pricing, benefits networks, and service quality.",
    seoTitle: "Best PEO Services for Small Business (2026)",
    seoDescription:
      "Compare PEO providers on pricing, benefits networks, and HR services. Find the right co-employment partner for your SMB.",
    sortOrder: 50,
  },
  {
    slug: "crm-software",
    name: "CRM Software",
    description:
      "Customer relationship management platforms for sales, service, and marketing teams. Compare contact and pipeline management, automation, reporting, and integration breadth across the leading CRMs.",
    seoTitle: "Best CRM Software for SMBs and Mid-Market (2026)",
    seoDescription:
      "Compare CRM software on pricing, integrations, ease of use, and reporting depth. Honest reviews for small business and mid-market buyers.",
    sortOrder: 60,
  },
];

type VendorSeed = {
  slug: string;
  categorySlug: string;
  name: string;
  websiteUrl: string;
  tagline: string;
  descriptionShort: string;
  descriptionLong: string;
  pricingModel: "free" | "freemium" | "paid" | "quote";
  pricingStartingAt?: string;
  bestForSegment: "smb" | "mid_market" | "enterprise" | "all";
  ourScore: number;
  pros: string[];
  cons: string[];
  keyFeatures: string[];
};

const vendors: VendorSeed[] = [
  // Debt collection software
  {
    slug: "quantrax",
    categorySlug: "debt-collection-software",
    name: "Quantrax",
    websiteUrl: "https://www.quantrax.com",
    tagline: "Intelligent collection and recovery management",
    descriptionShort:
      "Long-standing collection platform popular with mid-market and enterprise agencies for its rules engine and account-strategy automation.",
    descriptionLong:
      "Quantrax is one of the more established debt collection platforms in the US, focused on agencies and debt buyers that need a serious rules-driven account-strategy engine. Strong on automation, segmentation, and compliance workflows; lighter on modern UI polish than newer entrants.",
    pricingModel: "quote",
    bestForSegment: "mid_market",
    ourScore: 8,
    pros: [
      "Powerful, configurable rules and account-strategy engine",
      "Mature compliance and reporting tooling",
      "Strong fit for mid-market and enterprise agencies",
    ],
    cons: [
      "UI feels dated compared with newer SaaS entrants",
      "Onboarding and configuration require expertise",
      "Pricing is quote-only and can be steep for small shops",
    ],
    keyFeatures: [
      "Rules-driven account strategy",
      "Omni-channel contact management",
      "Payment processing and arrangements",
      "Compliance dashboards (TCPA, FDCPA, Reg F)",
      "Reporting and analytics",
    ],
  },
  {
    slug: "latitude-by-genesys",
    categorySlug: "debt-collection-software",
    name: "Latitude by Genesys",
    websiteUrl: "https://www.genesys.com/capabilities/latitude",
    tagline: "Enterprise debt-collection platform from Genesys",
    descriptionShort:
      "Enterprise-grade collection platform with deep CCaaS and Genesys ecosystem integration.",
    descriptionLong:
      "Latitude is a long-tenured collection platform now part of Genesys. Best for larger agencies and enterprise lenders that already use Genesys for contact center, since the integration story is unmatched in the segment.",
    pricingModel: "quote",
    bestForSegment: "enterprise",
    ourScore: 7,
    pros: [
      "Tight integration with Genesys CCaaS",
      "Enterprise-scale account management",
      "Strong compliance posture",
    ],
    cons: [
      "Heavier and more complex to deploy",
      "Pricing geared to enterprise budgets",
      "UX feels enterprise rather than modern SaaS",
    ],
    keyFeatures: [
      "Account and arrangement management",
      "Omni-channel via Genesys",
      "Compliance controls",
      "Reporting and analytics",
      "Deep API surface",
    ],
  },
  {
    slug: "dakcs",
    categorySlug: "debt-collection-software",
    name: "DAKCS Software",
    websiteUrl: "https://www.dakcs.com",
    tagline: "Beyond ARM and BankRight collection platforms",
    descriptionShort:
      "Family of agency-focused platforms (Beyond ARM, BankRight) with strong reputation in mid-market collections.",
    descriptionLong:
      "DAKCS sells two main platforms (Beyond ARM and BankRight) used by agencies and creditors. Known for solid customer service and a broad feature set covering core collections, payment processing, and creditor reporting.",
    pricingModel: "quote",
    bestForSegment: "mid_market",
    ourScore: 8,
    pros: [
      "Two product lines fit different segments",
      "Strong customer service reputation",
      "Mature compliance and reporting",
    ],
    cons: [
      "Quote-only pricing",
      "Less aggressive on modern UI updates",
      "Implementation timelines can be long",
    ],
    keyFeatures: [
      "Account management",
      "Payment processing",
      "Creditor / client portal",
      "Compliance reporting",
      "Omni-channel communication",
    ],
  },
  {
    slug: "beam",
    categorySlug: "debt-collection-software",
    name: "Beam",
    websiteUrl: "https://www.beamsoftware.com",
    tagline: "Modern collection software (formerly InterProse)",
    descriptionShort:
      "Cloud-based collection platform aimed at agencies that want a more modern, web-first feel than legacy systems.",
    descriptionLong:
      "Beam (the former InterProse) has rebuilt itself around a more modern, browser-first experience. Good fit for SMB and mid-market agencies that want a cleaner UI without sacrificing the rules engine and compliance features expected from enterprise platforms.",
    pricingModel: "quote",
    bestForSegment: "smb",
    ourScore: 8,
    pros: [
      "Cleaner, more modern UI than legacy peers",
      "Cloud-hosted with web access",
      "Good fit for SMB and growing agencies",
    ],
    cons: [
      "Smaller ecosystem than Quantrax or Genesys",
      "Quote-only pricing",
      "Reporting depth less mature than incumbents",
    ],
    keyFeatures: [
      "Cloud-based collection workflow",
      "Payment processing",
      "Letters and notices",
      "Compliance controls",
      "Reporting",
    ],
  },
  {
    slug: "collectmore",
    categorySlug: "debt-collection-software",
    name: "CollectMore by Lakeland",
    websiteUrl: "https://www.lakelandsoftware.com/collectmore",
    tagline: "Affordable collection software for small agencies",
    descriptionShort:
      "Long-running collection product from Lakeland, popular with small agencies for its low cost and straightforward feature set.",
    descriptionLong:
      "CollectMore from Lakeland Software is one of the more affordable options for small agencies and law firms. It covers the basics well: accounts, payments, letters, and reports, without the complexity (or budget) of enterprise platforms.",
    pricingModel: "paid",
    pricingStartingAt: "$95/mo",
    bestForSegment: "smb",
    ourScore: 7,
    pros: [
      "Affordable for small agencies",
      "Quick to onboard",
      "Reliable core feature set",
    ],
    cons: [
      "Limited automation versus enterprise tools",
      "UI shows its age",
      "Less suited for high-volume operations",
    ],
    keyFeatures: [
      "Account and payment management",
      "Letter generation",
      "Basic reporting",
      "Multi-user access",
      "Compliance basics",
    ],
  },

  // Business funding software
  {
    slug: "centrex",
    categorySlug: "business-funding-software",
    name: "Centrex",
    websiteUrl: "https://www.centrex.com",
    tagline: "MCA and small business loan CRM",
    descriptionShort:
      "Industry-specific CRM and loan-management platform built for MCA brokers, ISOs, and direct funders.",
    descriptionLong:
      "Centrex is one of the most-used CRMs in the MCA space, covering lead intake, pipeline management, deal docs, syndication, and post-funding servicing. Strong fit for shops that need software built around the MCA workflow rather than a generic CRM.",
    pricingModel: "quote",
    bestForSegment: "smb",
    ourScore: 8,
    pros: [
      "Purpose-built for MCA workflow",
      "Covers lead-to-funded plus syndication",
      "Active product roadmap",
    ],
    cons: [
      "UI dense for first-time users",
      "Quote-only pricing",
      "Less suited for non-MCA lending",
    ],
    keyFeatures: [
      "MCA-specific deal pipeline",
      "Syndication management",
      "Document workflow",
      "Servicing and collections",
      "Reporting",
    ],
  },
  {
    slug: "lendsaas",
    categorySlug: "business-funding-software",
    name: "LendSaaS",
    websiteUrl: "https://www.lendsaas.com",
    tagline: "All-in-one lending and MCA platform",
    descriptionShort:
      "End-to-end lending platform with strong MCA focus, covering origination, decisioning, servicing, and reporting.",
    descriptionLong:
      "LendSaaS positions as a more complete lending stack, with origination, automated decisioning, servicing, and reporting in one platform. Mid-market funders use it to consolidate multiple point tools.",
    pricingModel: "quote",
    bestForSegment: "mid_market",
    ourScore: 8,
    pros: [
      "Broad coverage from origination to servicing",
      "Decisioning automation",
      "Configurable workflows",
    ],
    cons: [
      "Larger lift to deploy than a CRM-only tool",
      "Quote-only pricing",
      "Better fit for established funders than brokers",
    ],
    keyFeatures: [
      "Origination and decisioning",
      "Servicing and collections",
      "Document automation",
      "Reporting",
      "API access",
    ],
  },
  {
    slug: "mca-suite",
    categorySlug: "business-funding-software",
    name: "MCA Suite",
    websiteUrl: "https://www.mcasuite.com",
    tagline: "MCA-specific deal and portfolio management",
    descriptionShort:
      "Lightweight platform focused specifically on MCA deal flow and portfolio servicing, popular with smaller brokers and funders.",
    descriptionLong:
      "MCA Suite stays narrow on purpose: deal management, portfolio servicing, and the MCA-specific math (factor rate, holdback, daily ACH) without trying to be a full CRM. Good fit for shops that already have a CRM and just need MCA-specific tooling on top.",
    pricingModel: "paid",
    pricingStartingAt: "$199/mo",
    bestForSegment: "smb",
    ourScore: 7,
    pros: [
      "Narrow MCA focus, easy to learn",
      "Affordable for small shops",
      "Handles MCA-specific calculations cleanly",
    ],
    cons: [
      "Not a full CRM",
      "Smaller integration ecosystem",
      "Reporting basic compared with broader platforms",
    ],
    keyFeatures: [
      "MCA deal management",
      "Portfolio servicing",
      "Daily ACH tracking",
      "Reporting",
      "Document storage",
    ],
  },
  {
    slug: "dealsync",
    categorySlug: "business-funding-software",
    name: "DealSync",
    websiteUrl: "https://www.dealsynccrm.com",
    tagline: "MCA-focused CRM for brokers",
    descriptionShort:
      "MCA-focused CRM built around the broker workflow, with strong submission and lender-matching tooling.",
    descriptionLong:
      "DealSync is a relative newcomer that targets MCA brokers with a workflow-focused CRM. Lender library, submission tracking, and pipeline are the core; less ambitious on servicing than Centrex or LendSaaS.",
    pricingModel: "paid",
    pricingStartingAt: "$149/mo",
    bestForSegment: "smb",
    ourScore: 7,
    pros: [
      "Modern, simple UI",
      "Lender library and submissions out of the box",
      "Predictable per-user pricing",
    ],
    cons: [
      "Less mature than Centrex",
      "Not aimed at direct funders",
      "Smaller community and integrations",
    ],
    keyFeatures: [
      "Pipeline and submissions",
      "Lender library",
      "Deal docs",
      "Reporting",
      "Email and SMS",
    ],
  },
  {
    slug: "funder-intel",
    categorySlug: "business-funding-software",
    name: "Funder Intel",
    websiteUrl: "https://www.funderintel.com",
    tagline: "Industry data and broker tools",
    descriptionShort:
      "Industry intelligence platform with broker-side tooling, popular for lender research and deal placement.",
    descriptionLong:
      "Funder Intel is more of an industry-data layer than a CRM, but its broker tools (lender database, placement help, news) make it part of many brokers' stacks. Often used alongside a CRM rather than instead of one.",
    pricingModel: "freemium",
    bestForSegment: "smb",
    ourScore: 7,
    pros: [
      "Best-in-class lender intelligence",
      "Helpful for newer brokers",
      "Affordable entry tier",
    ],
    cons: [
      "Not a full CRM",
      "Light on workflow features",
      "Limited integrations",
    ],
    keyFeatures: [
      "Lender database",
      "Industry news and analysis",
      "Placement guidance",
      "Broker community",
      "Reporting",
    ],
  },

  // Merchant services
  {
    slug: "stripe",
    categorySlug: "merchant-services",
    name: "Stripe",
    websiteUrl: "https://stripe.com",
    tagline: "Developer-first payment processing",
    descriptionShort:
      "Globally dominant developer-first payment processor, popular with online businesses and SaaS companies.",
    descriptionLong:
      "Stripe is the default for online and SaaS businesses thanks to its API-first design, broad feature set (subscriptions, invoicing, marketplaces, fraud), and predictable flat-rate pricing. Less ideal for thin-margin retail with heavy interchange-sensitive volume.",
    pricingModel: "paid",
    pricingStartingAt: "2.9% + 30c per transaction",
    bestForSegment: "all",
    ourScore: 9,
    pros: [
      "Best-in-class developer experience",
      "Huge feature breadth (subs, invoicing, marketplaces, etc.)",
      "Predictable flat-rate pricing",
    ],
    cons: [
      "Flat-rate is more expensive than interchange-plus at scale",
      "Account holds and resolution can be painful",
      "In-person hardware story weaker than Square's",
    ],
    keyFeatures: [
      "Online card processing",
      "Subscriptions and invoicing",
      "Marketplace payouts (Connect)",
      "Fraud prevention (Radar)",
      "Strong API and SDKs",
    ],
  },
  {
    slug: "square",
    categorySlug: "merchant-services",
    name: "Square",
    websiteUrl: "https://squareup.com",
    tagline: "All-in-one payments and POS",
    descriptionShort:
      "Strong all-in-one for SMBs needing in-person plus online payments, POS, and basic business tools.",
    descriptionLong:
      "Square shines for small businesses that want a single vendor for in-person hardware, online checkout, invoicing, payroll, and basic CRM. Flat-rate pricing is friendly for small volume and gets less competitive at scale.",
    pricingModel: "paid",
    pricingStartingAt: "2.6% + 10c per swipe",
    bestForSegment: "smb",
    ourScore: 9,
    pros: [
      "Excellent in-person hardware",
      "All-in-one with POS, invoicing, and payroll",
      "Easy onboarding",
    ],
    cons: [
      "Flat-rate is expensive at higher volume",
      "Account holds documented as a risk",
      "Customizability lower than developer-first peers",
    ],
    keyFeatures: [
      "In-person and online payments",
      "Square POS",
      "Invoicing and recurring billing",
      "Payroll and team management",
      "Marketing tools",
    ],
  },
  {
    slug: "helcim",
    categorySlug: "merchant-services",
    name: "Helcim",
    websiteUrl: "https://www.helcim.com",
    tagline: "Interchange-plus pricing for SMBs",
    descriptionShort:
      "Transparent interchange-plus pricing with no monthly fees, popular with growing SMBs over flat-rate processors.",
    descriptionLong:
      "Helcim offers interchange-plus pricing without monthly fees, which can save real money once a business hits modest volume (~$20K+/mo). Strong customer service and clear reporting; smaller hardware ecosystem than Square.",
    pricingModel: "paid",
    pricingStartingAt: "Interchange + 0.4% + 8c",
    bestForSegment: "smb",
    ourScore: 9,
    pros: [
      "Interchange-plus pricing, often cheaper at scale",
      "No monthly fees on standard plan",
      "Excellent customer service reputation",
    ],
    cons: [
      "Smaller hardware ecosystem",
      "Less name recognition than Stripe or Square",
      "Setup slightly more involved than flat-rate processors",
    ],
    keyFeatures: [
      "Interchange-plus pricing",
      "Online and in-person processing",
      "Invoicing and recurring billing",
      "Reporting",
      "Mobile app",
    ],
  },
  {
    slug: "stax",
    categorySlug: "merchant-services",
    name: "Stax",
    websiteUrl: "https://staxpayments.com",
    tagline: "Subscription-based merchant services",
    descriptionShort:
      "Membership-style merchant processor (formerly Fattmerchant) that charges a flat monthly fee plus interchange.",
    descriptionLong:
      "Stax (formerly Fattmerchant) flips the model: instead of percentage markup, you pay a monthly subscription on top of pure interchange. Math works in favor of mid-market merchants doing $20K+/mo.",
    pricingModel: "paid",
    pricingStartingAt: "$99/mo + interchange",
    bestForSegment: "mid_market",
    ourScore: 7,
    pros: [
      "Subscription pricing saves at scale",
      "No percentage markup",
      "Includes business management tools",
    ],
    cons: [
      "Monthly fee is a fixed cost regardless of volume",
      "Not the right fit for low-volume merchants",
      "Onboarding more involved than flat-rate processors",
    ],
    keyFeatures: [
      "Subscription + interchange pricing",
      "Online and in-person processing",
      "Recurring billing",
      "Reporting and analytics",
      "Customer management",
    ],
  },
  {
    slug: "paypal-zettle",
    categorySlug: "merchant-services",
    name: "PayPal Zettle",
    websiteUrl: "https://www.paypal.com/us/business/platforms-and-services/zettle",
    tagline: "PayPal-backed in-person payments",
    descriptionShort:
      "Compact in-person payments and POS from PayPal, popular with small retailers and pop-ups already using PayPal.",
    descriptionLong:
      "Zettle is PayPal's in-person processor, integrating tightly with the PayPal account and ecosystem. Good fit for small retailers, pop-ups, and service businesses that want simple hardware and a familiar payout flow.",
    pricingModel: "paid",
    pricingStartingAt: "2.29% + 9c per swipe",
    bestForSegment: "smb",
    ourScore: 7,
    pros: [
      "Tight PayPal integration",
      "Simple hardware",
      "No monthly fees",
    ],
    cons: [
      "Smaller feature set than Square",
      "Less developer story than Stripe",
      "Hardware ecosystem narrower",
    ],
    keyFeatures: [
      "In-person card readers",
      "Simple POS app",
      "PayPal payouts",
      "Inventory basics",
      "Reporting",
    ],
  },

  // POS systems
  {
    slug: "toast",
    categorySlug: "pos-systems",
    name: "Toast",
    websiteUrl: "https://pos.toasttab.com",
    tagline: "Restaurant POS and management platform",
    descriptionShort:
      "Restaurant-specific POS platform with deep features for table service, quick service, online ordering, and team management.",
    descriptionLong:
      "Toast is the dominant restaurant POS in the US, with hardware, online ordering, payroll, and team management built around the restaurant workflow. Pricing can climb fast as you add modules; flexibility is the trade.",
    pricingModel: "paid",
    pricingStartingAt: "$0/mo (pay-as-you-go) or custom",
    bestForSegment: "smb",
    ourScore: 9,
    pros: [
      "Built specifically for restaurants",
      "Strong online ordering and delivery integrations",
      "Mature ecosystem and integrations",
    ],
    cons: [
      "Costs add up as modules stack",
      "Hardware contracts are long",
      "Not for non-restaurant retail",
    ],
    keyFeatures: [
      "Restaurant POS",
      "Online ordering and delivery",
      "Payroll and team management",
      "Loyalty and gift cards",
      "Reporting and analytics",
    ],
  },
  {
    slug: "square-pos",
    categorySlug: "pos-systems",
    name: "Square POS",
    websiteUrl: "https://squareup.com/us/en/point-of-sale",
    tagline: "POS for any kind of business",
    descriptionShort:
      "General-purpose POS with strong fit for retail, service, and small restaurants.",
    descriptionLong:
      "Square POS is the easiest entry-point in the category. Free tier covers core POS, with paid add-ons for retail, restaurant, and service businesses. Hardware ecosystem is broad and affordable.",
    pricingModel: "freemium",
    pricingStartingAt: "$0",
    bestForSegment: "smb",
    ourScore: 9,
    pros: [
      "Free core POS",
      "Excellent hardware ecosystem",
      "Easy onboarding",
    ],
    cons: [
      "Restaurant features less deep than Toast",
      "Flat-rate processing pricier at scale",
      "Industry-specific features behind paid plans",
    ],
    keyFeatures: [
      "POS app on iPad and dedicated hardware",
      "Inventory management",
      "Customer database",
      "Reporting",
      "Online integrations",
    ],
  },
  {
    slug: "lightspeed",
    categorySlug: "pos-systems",
    name: "Lightspeed",
    websiteUrl: "https://www.lightspeedhq.com",
    tagline: "Cloud POS for retail, restaurant, and golf",
    descriptionShort:
      "Cloud POS platform with industry-specific editions for retail, restaurant, and specialty verticals.",
    descriptionLong:
      "Lightspeed offers separate, deeply customized editions for retail, restaurants, and golf clubs. Strong inventory and supplier management for retail; powerful menu and floor-management for restaurants.",
    pricingModel: "paid",
    pricingStartingAt: "$89/mo",
    bestForSegment: "smb",
    ourScore: 8,
    pros: [
      "Strong inventory and supplier features for retail",
      "Industry-specific editions",
      "Robust reporting",
    ],
    cons: [
      "Pricing higher than Square's free tier",
      "Setup time longer than entry-level POS",
      "Add-ons stack up in cost",
    ],
    keyFeatures: [
      "Industry-specific editions",
      "Inventory and supplier management",
      "Multi-location",
      "Loyalty and gift cards",
      "Reporting and analytics",
    ],
  },
  {
    slug: "clover",
    categorySlug: "pos-systems",
    name: "Clover",
    websiteUrl: "https://www.clover.com",
    tagline: "POS and payments for SMBs",
    descriptionShort:
      "Hardware-first POS distributed mostly through merchant-services partners, common with SMBs.",
    descriptionLong:
      "Clover sells through banks, ISOs, and merchant services partners, which means experience varies a lot by reseller. Hardware is solid and the app market gives flexibility, but lock-in to whatever processor your reseller pairs with is a real concern.",
    pricingModel: "paid",
    pricingStartingAt: "$14.95/mo + hardware",
    bestForSegment: "smb",
    ourScore: 7,
    pros: [
      "Solid hardware lineup",
      "App marketplace adds flexibility",
      "Widely available through merchant partners",
    ],
    cons: [
      "Reseller experience varies wildly",
      "Lock-in to specific processors common",
      "Reporting depth less than competitors",
    ],
    keyFeatures: [
      "Clover hardware lineup",
      "POS software",
      "App marketplace",
      "Inventory management",
      "Reporting",
    ],
  },
  {
    slug: "shopify-pos",
    categorySlug: "pos-systems",
    name: "Shopify POS",
    websiteUrl: "https://www.shopify.com/pos",
    tagline: "Best POS for ecommerce-first retailers",
    descriptionShort:
      "POS that pairs natively with Shopify ecommerce, ideal for omnichannel retailers running both stores and online sales.",
    descriptionLong:
      "Shopify POS is the obvious choice for retailers already on Shopify ecommerce. Inventory and customer data sync natively, so omnichannel reporting is much cleaner than with bolted-on integrations.",
    pricingModel: "paid",
    pricingStartingAt: "$0 (basic) or $89+/mo (PRO)",
    bestForSegment: "smb",
    ourScore: 8,
    pros: [
      "Native sync with Shopify ecommerce",
      "Clean omnichannel inventory and reporting",
      "Modern UI",
    ],
    cons: [
      "Best only if you use Shopify ecommerce",
      "Restaurant features minimal",
      "Hardware ecosystem narrower than Square or Clover",
    ],
    keyFeatures: [
      "Native Shopify sync",
      "Omnichannel inventory",
      "Customer profiles",
      "Reporting",
      "Mobile POS",
    ],
  },

  // PEO services
  {
    slug: "trinet",
    categorySlug: "peo-services",
    name: "TriNet",
    websiteUrl: "https://www.trinet.com",
    tagline: "Industry-aligned PEO and HR services",
    descriptionShort:
      "Large national PEO with industry-aligned offerings (tech, professional services, finance, etc.) and strong benefits networks.",
    descriptionLong:
      "TriNet is one of the largest US PEOs, structured around industry verticals so the benefits and HR practices fit common roles for that industry. Strong on benefits networks and compliance; less flexible than smaller PEOs on customization.",
    pricingModel: "quote",
    bestForSegment: "smb",
    ourScore: 8,
    pros: [
      "Industry-aligned offerings",
      "Strong benefits networks",
      "Mature compliance",
    ],
    cons: [
      "Less flexible than smaller PEOs",
      "Pricing geared to growing teams (10+)",
      "Service-quality variance reported by some customers",
    ],
    keyFeatures: [
      "Payroll and tax",
      "Health and ancillary benefits",
      "HR support",
      "Compliance and risk",
      "Industry-specific configurations",
    ],
  },
  {
    slug: "justworks",
    categorySlug: "peo-services",
    name: "Justworks",
    websiteUrl: "https://www.justworks.com",
    tagline: "Modern PEO for small businesses",
    descriptionShort:
      "Tech-forward PEO popular with startups and small businesses for its clean UI and predictable per-employee pricing.",
    descriptionLong:
      "Justworks targets small businesses and startups that want PEO benefits without enterprise complexity. Pricing is per-employee per-month and transparent on the website (rare in PEO). Clean UI; simpler than enterprise PEOs.",
    pricingModel: "paid",
    pricingStartingAt: "$59/employee/mo (Basic)",
    bestForSegment: "smb",
    ourScore: 9,
    pros: [
      "Transparent per-employee pricing",
      "Clean modern UI",
      "Strong fit for startups and small teams",
    ],
    cons: [
      "Smaller benefits network than enterprise PEOs",
      "Less customization for larger or specialized companies",
      "International support added more recently",
    ],
    keyFeatures: [
      "Payroll and tax",
      "Health and ancillary benefits",
      "HR support",
      "Compliance",
      "Time tracking",
    ],
  },
  {
    slug: "insperity",
    categorySlug: "peo-services",
    name: "Insperity",
    websiteUrl: "https://www.insperity.com",
    tagline: "Full-service PEO for established SMBs",
    descriptionShort:
      "Long-standing national PEO with deep HR services and broad benefits, generally aimed at SMBs with 10+ employees.",
    descriptionLong:
      "Insperity is one of the older national PEOs, offering payroll, benefits, HR, training, and risk management. Deeper HR services than newer entrants; pricing not transparent and best for SMBs willing to commit to a more bundled model.",
    pricingModel: "quote",
    bestForSegment: "smb",
    ourScore: 8,
    pros: [
      "Deep HR and training services",
      "Strong benefits networks",
      "Long track record",
    ],
    cons: [
      "Quote-only pricing",
      "Best for 10+ employee companies",
      "Less flexible than newer PEOs",
    ],
    keyFeatures: [
      "Payroll and tax",
      "Health and ancillary benefits",
      "HR services",
      "Training and development",
      "Risk management",
    ],
  },
  {
    slug: "adp-totalsource",
    categorySlug: "peo-services",
    name: "ADP TotalSource",
    websiteUrl: "https://www.adp.com/what-we-offer/products/peo.aspx",
    tagline: "ADP's PEO offering",
    descriptionShort:
      "Enterprise-scale PEO from ADP, leveraging ADP's payroll and benefits scale.",
    descriptionLong:
      "ADP TotalSource is the PEO arm of payroll giant ADP. Strong scale advantages on benefits and compliance; suits SMBs that already use ADP and want to consolidate, or growing companies that want a national-scale PEO.",
    pricingModel: "quote",
    bestForSegment: "smb",
    ourScore: 7,
    pros: [
      "ADP scale on benefits and compliance",
      "Single-vendor consolidation if already on ADP",
      "Wide industry coverage",
    ],
    cons: [
      "Quote-only pricing",
      "Customer-service experience varies",
      "Less nimble than smaller PEOs",
    ],
    keyFeatures: [
      "Payroll and tax",
      "Benefits administration",
      "HR support",
      "Compliance",
      "Workers' comp",
    ],
  },
  {
    slug: "paychex-peo",
    categorySlug: "peo-services",
    name: "Paychex PEO",
    websiteUrl: "https://www.paychex.com/peo",
    tagline: "PEO from Paychex",
    descriptionShort:
      "PEO from payroll provider Paychex, common for SMBs already on the Paychex payroll platform.",
    descriptionLong:
      "Paychex's PEO leverages the company's payroll platform and compliance infrastructure. Fits SMBs that want to upgrade from Paychex payroll to a full PEO without changing vendors.",
    pricingModel: "quote",
    bestForSegment: "smb",
    ourScore: 7,
    pros: [
      "Easy upgrade path from Paychex payroll",
      "Solid compliance",
      "Broad benefits options",
    ],
    cons: [
      "Quote-only pricing",
      "UX more legacy than newer entrants",
      "Service experience varies",
    ],
    keyFeatures: [
      "Payroll and tax",
      "Benefits",
      "HR support",
      "Compliance",
      "Workers' comp",
    ],
  },

  // CRM software
  {
    slug: "hubspot",
    categorySlug: "crm-software",
    name: "HubSpot",
    websiteUrl: "https://www.hubspot.com",
    tagline: "All-in-one CRM with marketing, sales, and service",
    descriptionShort:
      "Inbound-marketing-led CRM with strong free tier, popular with SMBs that want sales, marketing, and service in one stack.",
    descriptionLong:
      "HubSpot's free CRM is hard to beat as a starting point, and the paid Hubs (Marketing, Sales, Service, CMS, Operations) extend the platform deep into each function. Pricing climbs sharply as contact lists grow and feature tiers stack.",
    pricingModel: "freemium",
    pricingStartingAt: "$0 (free CRM) or $20+/mo per seat",
    bestForSegment: "smb",
    ourScore: 9,
    pros: [
      "Excellent free CRM tier",
      "Strong marketing automation in same platform",
      "Best-in-class onboarding and education",
    ],
    cons: [
      "Pricing scales steeply with contact count",
      "Marketing Hub power needs the higher tiers",
      "Less customizable than Salesforce at the top end",
    ],
    keyFeatures: [
      "Free CRM with contacts, deals, tasks",
      "Marketing automation",
      "Sales sequences",
      "Service ticketing",
      "Reporting",
    ],
  },
  {
    slug: "salesforce-sales-cloud",
    categorySlug: "crm-software",
    name: "Salesforce Sales Cloud",
    websiteUrl: "https://www.salesforce.com/sales/sales-cloud",
    tagline: "The enterprise CRM standard",
    descriptionShort:
      "Industry-standard CRM with the broadest customization and ecosystem, best for mid-market and enterprise sales orgs.",
    descriptionLong:
      "Salesforce Sales Cloud is the dominant enterprise CRM, with unmatched customization, ecosystem, and marketplace. Power and complexity both very high; usually requires implementation and admin support.",
    pricingModel: "paid",
    pricingStartingAt: "$25/user/mo (Starter)",
    bestForSegment: "mid_market",
    ourScore: 9,
    pros: [
      "Unmatched customization and ecosystem",
      "Industry-standard with abundant talent",
      "Deep reporting and forecasting",
    ],
    cons: [
      "Steep learning curve",
      "Implementation and admin costs are real",
      "Pricing climbs fast with seats and features",
    ],
    keyFeatures: [
      "Accounts, contacts, leads, opportunities",
      "Workflow automation",
      "Reporting and forecasting",
      "AppExchange ecosystem",
      "Customization platform",
    ],
  },
  {
    slug: "pipedrive",
    categorySlug: "crm-software",
    name: "Pipedrive",
    websiteUrl: "https://www.pipedrive.com",
    tagline: "Pipeline-focused CRM for sales teams",
    descriptionShort:
      "Sales-pipeline-first CRM popular with small sales teams that want a simple, deal-flow-focused tool.",
    descriptionLong:
      "Pipedrive stays focused on the sales pipeline rather than trying to be everything. Visual deal boards, simple automations, and clean UX make it a strong fit for small sales teams that aren't ready for HubSpot or Salesforce.",
    pricingModel: "paid",
    pricingStartingAt: "$14/user/mo",
    bestForSegment: "smb",
    ourScore: 8,
    pros: [
      "Pipeline-focused, easy to learn",
      "Affordable per-seat pricing",
      "Clean modern UI",
    ],
    cons: [
      "Marketing automation lighter than HubSpot",
      "Reporting depth less than Salesforce",
      "Customization more limited at the top end",
    ],
    keyFeatures: [
      "Visual deal pipeline",
      "Activity tracking",
      "Email integration",
      "Reporting",
      "Workflow automation",
    ],
  },
  {
    slug: "zoho-crm",
    categorySlug: "crm-software",
    name: "Zoho CRM",
    websiteUrl: "https://www.zoho.com/crm",
    tagline: "Affordable CRM with a broad suite",
    descriptionShort:
      "Affordable, full-featured CRM that's part of Zoho's broader business suite, popular with SMBs that want bundle savings.",
    descriptionLong:
      "Zoho CRM is one of the most affordable feature-rich CRMs and benefits from being part of Zoho's broader business suite (mail, books, projects, etc.). Best fit for SMBs comfortable in the Zoho ecosystem.",
    pricingModel: "paid",
    pricingStartingAt: "$14/user/mo",
    bestForSegment: "smb",
    ourScore: 8,
    pros: [
      "Affordable feature-rich pricing",
      "Tight integration with Zoho suite",
      "Strong customization for the price",
    ],
    cons: [
      "UX less polished than HubSpot or Pipedrive",
      "Best when used inside the Zoho ecosystem",
      "Support quality varies by region",
    ],
    keyFeatures: [
      "Sales pipeline and automation",
      "Email and telephony integration",
      "Reporting and analytics",
      "Workflow automation",
      "Customization",
    ],
  },
  {
    slug: "close",
    categorySlug: "crm-software",
    name: "Close",
    websiteUrl: "https://close.com",
    tagline: "Inside-sales CRM with built-in calling",
    descriptionShort:
      "Inside-sales-focused CRM with built-in calling and SMS, popular with high-volume sales teams.",
    descriptionLong:
      "Close was built for inside sales teams that live on the phone. Power dialer, SMS, and email sequences are first-class; not aimed at marketing-heavy or service-led teams.",
    pricingModel: "paid",
    pricingStartingAt: "$49/user/mo",
    bestForSegment: "smb",
    ourScore: 8,
    pros: [
      "Built-in calling and SMS",
      "Power dialer and sequences",
      "Strong fit for high-volume inside sales",
    ],
    cons: [
      "More expensive than Pipedrive or Zoho",
      "Marketing tooling lighter",
      "Smaller ecosystem than HubSpot or Salesforce",
    ],
    keyFeatures: [
      "Built-in calling and SMS",
      "Power dialer",
      "Email sequences",
      "Pipeline management",
      "Reporting",
    ],
  },
];

type ComparisonSeed = {
  vendorASlug: string;
  vendorBSlug: string;
};

const comparisons: ComparisonSeed[] = [
  { vendorASlug: "stripe", vendorBSlug: "square" },
  { vendorASlug: "hubspot", vendorBSlug: "salesforce-sales-cloud" },
  { vendorASlug: "hubspot", vendorBSlug: "pipedrive" },
  { vendorASlug: "toast", vendorBSlug: "square-pos" },
  { vendorASlug: "trinet", vendorBSlug: "justworks" },
  { vendorASlug: "centrex", vendorBSlug: "lendsaas" },
  { vendorASlug: "quantrax", vendorBSlug: "dakcs" },
  { vendorASlug: "helcim", vendorBSlug: "stripe" },
];

type BuyerGuideSeed = {
  categorySlug: string;
  slug: string;
  title: string;
  bodyMarkdown: string;
};

const buyerGuides: BuyerGuideSeed[] = [
  {
    categorySlug: "debt-collection-software",
    slug: "debt-collection-software-buyers-guide",
    title: "How to choose debt collection software",
    bodyMarkdown:
      "## What this guide covers\n\nThis guide walks you through how to evaluate debt collection software in 2026, what features matter for agencies vs. law firms vs. debt buyers, and where the major platforms differ in practice.\n\n*Full content lands as part of the M6 content pipeline.*",
  },
  {
    categorySlug: "business-funding-software",
    slug: "business-funding-software-buyers-guide",
    title: "Choosing the right CRM for an MCA shop",
    bodyMarkdown:
      "## What this guide covers\n\nMCA shops have specific workflow needs (factor rates, daily ACH, syndication) that generic CRMs miss. This guide walks through what to look for in a purpose-built MCA platform versus stitching together generic tools.\n\n*Full content lands as part of the M6 content pipeline.*",
  },
  {
    categorySlug: "merchant-services",
    slug: "merchant-services-buyers-guide",
    title: "Merchant services pricing models compared",
    bodyMarkdown:
      "## What this guide covers\n\nFlat-rate, interchange-plus, tiered, and subscription pricing each win at different volume levels. This guide explains the math, the trade-offs, and the merchant profiles where each model wins.\n\n*Full content lands as part of the M6 content pipeline.*",
  },
  {
    categorySlug: "pos-systems",
    slug: "pos-systems-buyers-guide",
    title: "How to pick a POS system",
    bodyMarkdown:
      "## What this guide covers\n\nThe right POS depends on the kind of business: retail, restaurant, and service all have different priorities. This guide breaks down the questions to ask, the costs to budget for, and the systems that win for each profile.\n\n*Full content lands as part of the M6 content pipeline.*",
  },
  {
    categorySlug: "peo-services",
    slug: "peo-services-buyers-guide",
    title: "PEO services explained",
    bodyMarkdown:
      "## What this guide covers\n\nA PEO co-employs your staff and brings their benefits, payroll, and HR scale. This guide explains the model, who it works for, what it costs, and how the major national PEOs differ.\n\n*Full content lands as part of the M6 content pipeline.*",
  },
  {
    categorySlug: "crm-software",
    slug: "crm-software-buyers-guide",
    title: "How to choose a CRM for SMB or mid-market",
    bodyMarkdown:
      "## What this guide covers\n\nThe CRM market is crowded and the right answer depends on team size, marketing maturity, and budget. This guide walks through how to think about the trade-off between simplicity (Pipedrive, Close) and platform breadth (HubSpot, Salesforce).\n\n*Full content lands as part of the M6 content pipeline.*",
  },
];

async function main() {
  console.log("Seeding categories...");
  for (const c of categories) {
    await db.category.upsert({
      where: { slug: c.slug },
      update: {
        name: c.name,
        description: c.description,
        seoTitle: c.seoTitle,
        seoDescription: c.seoDescription,
        sortOrder: c.sortOrder,
        isActive: true,
      },
      create: {
        slug: c.slug,
        name: c.name,
        description: c.description,
        seoTitle: c.seoTitle,
        seoDescription: c.seoDescription,
        sortOrder: c.sortOrder,
        isActive: true,
      },
    });
    console.log(`  ${c.slug}`);
  }

  console.log("Seeding vendors...");
  for (const v of vendors) {
    const category = await db.category.findUnique({
      where: { slug: v.categorySlug },
    });
    if (!category) throw new Error(`Missing category: ${v.categorySlug}`);

    await db.vendor.upsert({
      where: { slug: v.slug },
      update: {
        name: v.name,
        websiteUrl: v.websiteUrl,
        categoryId: category.id,
        tagline: v.tagline,
        descriptionShort: v.descriptionShort,
        descriptionLong: v.descriptionLong,
        pricingModel: v.pricingModel,
        pricingStartingAt: v.pricingStartingAt ?? null,
        bestForSegment: v.bestForSegment,
        ourScore: v.ourScore,
        pros: v.pros,
        cons: v.cons,
        keyFeatures: v.keyFeatures,
        status: "published",
      },
      create: {
        slug: v.slug,
        name: v.name,
        websiteUrl: v.websiteUrl,
        categoryId: category.id,
        tagline: v.tagline,
        descriptionShort: v.descriptionShort,
        descriptionLong: v.descriptionLong,
        pricingModel: v.pricingModel,
        pricingStartingAt: v.pricingStartingAt ?? null,
        bestForSegment: v.bestForSegment,
        ourScore: v.ourScore,
        pros: v.pros,
        cons: v.cons,
        keyFeatures: v.keyFeatures,
        status: "published",
      },
    });
    console.log(`  ${v.categorySlug}/${v.slug}`);
  }

  console.log("Seeding buyer guides...");
  for (const g of buyerGuides) {
    const category = await db.category.findUnique({
      where: { slug: g.categorySlug },
    });
    if (!category) throw new Error(`Missing category: ${g.categorySlug}`);

    await db.buyerGuide.upsert({
      where: { slug: g.slug },
      update: {
        title: g.title,
        bodyMarkdown: g.bodyMarkdown,
        categoryId: category.id,
        isPublished: true,
      },
      create: {
        slug: g.slug,
        title: g.title,
        bodyMarkdown: g.bodyMarkdown,
        categoryId: category.id,
        isPublished: true,
      },
    });
    console.log(`  ${g.slug}`);
  }

  console.log("Seeding comparisons...");
  function vsSlug(a: string, b: string): string {
    const [first, second] = [a, b].sort();
    return `${first}-vs-${second}`;
  }
  for (const c of comparisons) {
    const [vA, vB] = await Promise.all([
      db.vendor.findUnique({ where: { slug: c.vendorASlug } }),
      db.vendor.findUnique({ where: { slug: c.vendorBSlug } }),
    ]);
    if (!vA || !vB) {
      console.warn(`  skip: missing vendor for ${c.vendorASlug} or ${c.vendorBSlug}`);
      continue;
    }
    const slug = vsSlug(vA.slug, vB.slug);
    await db.comparison.upsert({
      where: { slug },
      update: {
        vendorAId: vA.id,
        vendorBId: vB.id,
        isPublished: true,
      },
      create: {
        slug,
        vendorAId: vA.id,
        vendorBId: vB.id,
        isPublished: true,
      },
    });
    console.log(`  ${slug}`);
  }

  const counts = {
    categories: await db.category.count(),
    vendors: await db.vendor.count(),
    buyerGuides: await db.buyerGuide.count(),
    comparisons: await db.comparison.count(),
  };
  console.log("Done.", counts);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
