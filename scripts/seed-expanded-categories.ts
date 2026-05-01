/**
 * Adds 12 more categories on top of the original 6, with 5 vendors each.
 * Idempotent (upsert by slug).
 *
 * Usage: pnpm tsx scripts/seed-expanded-categories.ts
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
    slug: "marketing-automation",
    name: "Marketing Automation",
    description:
      "Email, lifecycle, and multi-channel marketing automation platforms. Compares list/CRM tooling, automation workflows, A/B testing, and analytics depth.",
    seoTitle: "Best Marketing Automation Software (2026)",
    seoDescription:
      "Compare marketing automation platforms on workflow depth, deliverability, integrations, and pricing.",
    sortOrder: 70,
  },
  {
    slug: "email-marketing",
    name: "Email Marketing",
    description:
      "Email service providers focused on broadcasts, newsletters, and basic automation. For teams that need solid email without enterprise-grade automation.",
    seoTitle: "Best Email Marketing Software (2026)",
    seoDescription:
      "Compare email marketing platforms on deliverability, list management, design tools, and pricing.",
    sortOrder: 80,
  },
  {
    slug: "help-desk-software",
    name: "Help Desk Software",
    description:
      "Customer support and ticketing platforms covering shared inbox, escalations, knowledge base, and agent tooling.",
    seoTitle: "Best Help Desk Software (2026)",
    seoDescription:
      "Compare help desk and ticketing platforms on agent UX, automation, knowledge base, and pricing.",
    sortOrder: 90,
  },
  {
    slug: "project-management",
    name: "Project Management",
    description:
      "Project, task, and team-collaboration platforms for shipping work. Compares planning, view types, automation, and integration breadth.",
    seoTitle: "Best Project Management Software (2026)",
    seoDescription:
      "Compare project management platforms on planning models, team views, automation, and pricing.",
    sortOrder: 100,
  },
  {
    slug: "hr-software",
    name: "HR Software",
    description:
      "All-in-one HR information systems (HRIS) for payroll, benefits, onboarding, and people operations - excluding the PEO model.",
    seoTitle: "Best HR Software (2026)",
    seoDescription:
      "Compare HR platforms on payroll, benefits, onboarding, and people-ops tooling. Honest reviews for SMBs and mid-market.",
    sortOrder: 110,
  },
  {
    slug: "accounting-software",
    name: "Accounting Software",
    description:
      "Bookkeeping and accounting platforms for SMBs and growing businesses. Covers core ledger, AR/AP, payroll integration, and reporting.",
    seoTitle: "Best Accounting Software (2026)",
    seoDescription:
      "Compare accounting platforms on ledger depth, integrations, reporting, and pricing.",
    sortOrder: 120,
  },
  {
    slug: "ecommerce-platforms",
    name: "Ecommerce Platforms",
    description:
      "Online store builders and full ecommerce platforms - covering hosted SaaS, headless, and enterprise options for B2C and B2B sellers.",
    seoTitle: "Best Ecommerce Platforms (2026)",
    seoDescription:
      "Compare ecommerce platforms on conversion features, customization depth, payment options, and pricing.",
    sortOrder: 130,
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    description:
      "Endpoint, identity, and SaaS security platforms aimed at SMB and mid-market buyers - including EDR, MDM, IAM, and email security.",
    seoTitle: "Best Cybersecurity Software for SMBs (2026)",
    seoDescription:
      "Compare cybersecurity platforms on threat coverage, ease of deployment, MSP support, and pricing.",
    sortOrder: 140,
  },
  {
    slug: "survey-tools",
    name: "Survey Tools",
    description:
      "Survey, form, and feedback platforms - ranging from quick polls to enterprise NPS and CX programs.",
    seoTitle: "Best Survey & Feedback Software (2026)",
    seoDescription:
      "Compare survey platforms on logic depth, distribution, analytics, and pricing.",
    sortOrder: 150,
  },
  {
    slug: "esignature",
    name: "E-Signature",
    description:
      "Electronic signature platforms for contracts, sales documents, and HR workflows. Covers core signing, templates, audit trails, and integrations.",
    seoTitle: "Best E-Signature Software (2026)",
    seoDescription:
      "Compare e-signature platforms on legal compliance, integration depth, templates, and pricing.",
    sortOrder: 160,
  },
  {
    slug: "live-chat",
    name: "Live Chat & Customer Messaging",
    description:
      "Live chat and customer-messaging platforms - both customer support and sales-led. Covers chatbots, knowledge base, and proactive messaging.",
    seoTitle: "Best Live Chat & Messaging Software (2026)",
    seoDescription:
      "Compare live chat platforms on bots, agent workflows, marketing tools, and pricing.",
    sortOrder: 170,
  },
  {
    slug: "analytics-platforms",
    name: "Analytics Platforms",
    description:
      "Product, marketing, and BI analytics platforms - from event tracking to full self-serve BI. For teams that want to actually understand what's happening.",
    seoTitle: "Best Analytics Platforms for SMBs and Mid-Market (2026)",
    seoDescription:
      "Compare analytics platforms on event tracking depth, data modeling, dashboarding, and pricing.",
    sortOrder: 180,
  },
];

type V = {
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

const vendors: V[] = [
  // Marketing automation
  v("hubspot-marketing", "marketing-automation", "HubSpot Marketing Hub", "https://www.hubspot.com/products/marketing", "Marketing automation in HubSpot's CRM",
    "HubSpot's marketing platform - sequences, lists, landing pages, and reporting all in the same CRM your sales team uses.",
    "HubSpot Marketing Hub is the top-tier choice for SMBs that want marketing, sales, and service in one platform. The free tier is generous; pricing scales sharply with contact count.",
    "freemium", "$20/mo (Marketing Hub Starter)", "smb", 9,
    ["Sits inside the HubSpot CRM", "Powerful workflows + smart content", "Excellent academy and onboarding"],
    ["Pricing climbs steeply with contacts", "Marketing Hub power needs Pro tier or above", "Email-design tools less flexible than dedicated ESPs"],
    ["Workflow automation", "Landing pages and forms", "Email sequences", "List segmentation", "Reporting"]),
  v("activecampaign", "marketing-automation", "ActiveCampaign", "https://www.activecampaign.com", "Email + automation for SMBs",
    "ActiveCampaign is one of the best-value marketing automation platforms for SMBs - strong on automation depth without enterprise pricing.",
    "ActiveCampaign sits between basic ESPs (Mailchimp, ConvertKit) and enterprise platforms (Marketo, HubSpot Pro). Strong automation builder, decent CRM, fair pricing.",
    "paid", "$15/mo", "smb", 9,
    ["Excellent automation builder", "Fair pricing for the depth", "Built-in light CRM"],
    ["UI dense for first-time users", "Reporting less polished than HubSpot's", "Smaller agency ecosystem"],
    ["Visual automation builder", "Email + SMS", "Lead scoring", "Reporting", "CRM contacts"]),
  v("marketo", "marketing-automation", "Marketo Engage", "https://www.adobe.com/products/marketo.html", "Adobe's enterprise marketing automation",
    "Marketo (now part of Adobe) is the enterprise standard for B2B marketing operations and complex programs.",
    "Marketo Engage is built for B2B marketing ops teams running complex multi-touch programs at scale. Powerful but a real lift to deploy and run.",
    "quote", undefined, "enterprise", 8,
    ["Industry-leading B2B feature depth", "Adobe ecosystem integration", "Massive partner / consultant network"],
    ["Steep learning curve", "Implementation costs are real", "Smaller than HubSpot at SMB scale"],
    ["Engagement programs", "Lead scoring + routing", "Account-based marketing", "Multi-touch attribution", "API and ecosystem"]),
  v("klaviyo", "marketing-automation", "Klaviyo", "https://www.klaviyo.com", "Marketing automation for ecommerce",
    "Klaviyo dominates ecommerce email + SMS, with deep Shopify and BigCommerce integrations and a strong segmentation engine.",
    "Klaviyo is the default for Shopify stores serious about lifecycle marketing. Behavioral segmentation is best-in-class. Pricing scales with profiles, which can sting at scale.",
    "freemium", "$30/mo", "smb", 9,
    ["Best-in-class ecommerce integrations", "Deep behavioral segmentation", "SMS + email in one tool"],
    ["Pricing climbs with active profiles", "Less suited to non-ecom B2B", "Workflow UI can be busy"],
    ["Email and SMS automation", "Behavioral segments", "Predictive analytics", "Shopify / BigCommerce sync", "Reporting"]),
  v("customerio", "marketing-automation", "Customer.io", "https://customer.io", "Lifecycle messaging for product companies",
    "Customer.io is built for product-led companies that want event-driven lifecycle messaging across email, push, and in-app.",
    "Customer.io targets SaaS and product-led growth teams. Event-driven workflows, strong API, and modern UX put it ahead for technical buyers.",
    "paid", "$100/mo (Essentials)", "smb", 8,
    ["Event-driven, developer-friendly", "Multi-channel (email, push, SMS, in-app)", "Strong API and Liquid templating"],
    ["Heavier setup than HubSpot", "Pricing notable for low-volume teams", "Less marketer-friendly than ActiveCampaign"],
    ["Event-driven workflows", "Multi-channel messaging", "Liquid template engine", "Webhooks + API", "Reporting"]),

  // Email marketing
  v("mailchimp", "email-marketing", "Mailchimp", "https://mailchimp.com", "Email marketing for small business",
    "Mailchimp is the default starting point for small businesses doing email - generous free tier, lots of templates, easy onboarding.",
    "Mailchimp's free tier and library of templates make it the easy starting point. Power features and pricing get less competitive at scale.",
    "freemium", "$0 (free) or $13+/mo", "smb", 8,
    ["Easy onboarding", "Generous free tier", "Solid template library"],
    ["Pricing scales steeply", "Automation lighter than ActiveCampaign", "Brand reputation has slipped post-Intuit"],
    ["Drag-and-drop builder", "Templates", "Basic automation", "Audience management", "Reporting"]),
  v("convertkit", "email-marketing", "ConvertKit (Kit)", "https://kit.com", "Email marketing for creators",
    "ConvertKit (rebranded as Kit) is the email platform built for creators - newsletters, paid subscriptions, and creator-friendly automation.",
    "Kit is built for creators publishing newsletters and selling digital products. Strong tagging and sequences; lighter on traditional marketing-automation needs.",
    "freemium", "$0 (free) or $15+/mo", "smb", 8,
    ["Creator-focused tooling", "Paid newsletter support built-in", "Clean, simple UX"],
    ["Less suited for non-creator businesses", "Reporting basic", "Smaller integration ecosystem"],
    ["Sequences", "Tags + segments", "Paid subscriptions", "Landing pages", "Reporting"]),
  v("brevo", "email-marketing", "Brevo (formerly Sendinblue)", "https://www.brevo.com", "Email + SMS at SMB-friendly prices",
    "Brevo (formerly Sendinblue) is one of the most affordable email + SMS platforms with surprisingly deep automation for the price.",
    "Brevo is a strong value play - email, SMS, and basic CRM at prices that beat Mailchimp at scale. UX has improved significantly post-rebrand.",
    "freemium", "$0 (free) or $9+/mo", "smb", 8,
    ["Aggressive pricing", "Email + SMS in one platform", "Built-in light CRM"],
    ["Brand recognition lower than Mailchimp", "Deliverability historically uneven", "Template library smaller"],
    ["Email and SMS", "Marketing automation", "CRM contacts", "Landing pages", "Reporting"]),
  v("constant-contact", "email-marketing", "Constant Contact", "https://www.constantcontact.com", "Email marketing for traditional SMBs",
    "Constant Contact is the long-running email platform popular with small businesses, nonprofits, and event-heavy organizations.",
    "Constant Contact serves traditional SMBs and nonprofits well - simple email, event tools, donation forms. Less suited for product-led or tech-savvy buyers.",
    "paid", "$12/mo", "smb", 7,
    ["Strong nonprofit features", "Event tools built-in", "Phone support included"],
    ["UI feels dated", "Automation lighter than ActiveCampaign", "Pricing not the cheapest"],
    ["Email campaigns", "Event marketing", "Contact lists", "Reporting", "Templates"]),
  v("beehiiv", "email-marketing", "beehiiv", "https://www.beehiiv.com", "Newsletter platform for serious creators",
    "beehiiv is the modern newsletter platform built by ex-Morning Brew folks - growth tools, ads, and revenue features creators care about.",
    "beehiiv is the fastest-growing newsletter platform among serious creators and media businesses. Strong on growth tooling, ads marketplace, and modern UX.",
    "freemium", "$0 (free) or $49+/mo", "smb", 8,
    ["Modern, creator-focused UX", "Built-in growth and ad network", "Generous free tier"],
    ["Newer brand", "Less B2B/automation-focused", "Reporting still maturing"],
    ["Newsletter publishing", "Subscription forms", "Boosts and ad network", "Referral programs", "Analytics"]),

  // Help desk software
  v("zendesk", "help-desk-software", "Zendesk", "https://www.zendesk.com", "Enterprise customer service platform",
    "Zendesk is the customer-service platform standard for mid-market and enterprise - tickets, chat, AI, and a deep app marketplace.",
    "Zendesk has the deepest feature set in customer service: omnichannel, AI agent, knowledge base, and a vast marketplace. Pricing reflects the breadth.",
    "paid", "$25/agent/mo", "mid_market", 8,
    ["Industry-standard feature depth", "Strong app marketplace", "Mature analytics + reporting"],
    ["Pricing climbs fast", "Implementation effort real", "UI feels enterprise rather than modern"],
    ["Tickets and shared inbox", "Knowledge base (Guide)", "Live chat", "AI agent", "Reporting and analytics"]),
  v("freshdesk", "help-desk-software", "Freshdesk", "https://www.freshworks.com/freshdesk", "Help desk from Freshworks",
    "Freshdesk is a strong Zendesk alternative for SMB and mid-market teams - core tickets, knowledge base, and reporting at lower price points.",
    "Freshdesk gives you 80% of Zendesk's feature set at a fraction of the price - especially attractive for SMBs that don't need the most advanced AI or omnichannel.",
    "freemium", "$0 (free) or $15+/agent/mo", "smb", 8,
    ["Lower price than Zendesk", "Free tier for small teams", "Decent core feature set"],
    ["Less polished than Zendesk at scale", "Smaller marketplace", "AI features still maturing"],
    ["Tickets", "Knowledge base", "Multi-channel inbox", "Automation", "Reporting"]),
  v("intercom", "help-desk-software", "Intercom", "https://www.intercom.com", "Customer messaging + AI agent",
    "Intercom blurs help desk and customer messaging - in-product chat, knowledge base, and Fin AI agent for product-led companies.",
    "Intercom is best for product-led companies that want chat-led support with AI deflection. The Fin AI agent is industry-leading; pricing is steep.",
    "paid", "$39/seat/mo + Fin pricing", "smb", 8,
    ["Best-in-class AI agent (Fin)", "Tightly integrated chat + help desk", "Modern UX"],
    ["AI deflection priced per resolution", "Less suited for non-product-led B2B", "Reporting depth less mature than Zendesk"],
    ["Live chat + Messenger", "AI agent (Fin)", "Help center", "Workflows", "Reporting"]),
  v("hubspot-service", "help-desk-software", "HubSpot Service Hub", "https://www.hubspot.com/products/service", "Service in the HubSpot CRM",
    "HubSpot Service Hub is the natural choice for teams already on HubSpot's CRM - tickets, knowledge base, and feedback in one platform.",
    "Service Hub is fine for HubSpot-native teams. Less mature than Zendesk for high-volume support, but the CRM integration is unmatched.",
    "freemium", "$0 or $20+/mo", "smb", 7,
    ["Native HubSpot CRM integration", "Free tier for small teams", "Familiar UX if already on HubSpot"],
    ["Lighter feature set than dedicated tools", "Pricing scales with seats and contacts", "AI features less developed than Intercom"],
    ["Tickets", "Knowledge base", "Customer feedback", "Live chat", "Reporting"]),
  v("kustomer", "help-desk-software", "Kustomer", "https://www.kustomer.com", "Customer service platform from Meta",
    "Kustomer (acquired by Meta) is a unified customer service platform built around the customer rather than the ticket.",
    "Kustomer offers a customer-centric data model that's a real differentiator - timeline view of every interaction. Best for retail and e-commerce service teams.",
    "quote", undefined, "mid_market", 7,
    ["Customer-centric data model", "Strong retail/ecom features", "Meta backing"],
    ["Quote-only pricing", "Smaller ecosystem than Zendesk", "Less suited for B2B SaaS"],
    ["Unified customer timeline", "Omnichannel", "Workflow automation", "Reporting", "Integrations"]),

  // Project management
  v("asana", "project-management", "Asana", "https://asana.com", "Work management for teams",
    "Asana is one of the most polished work-management platforms for cross-functional teams - task views, projects, goals, and reporting.",
    "Asana sits in the sweet spot between simple task tools and enterprise work-management platforms. Clean UX, strong views, fair pricing.",
    "freemium", "$0 (free) or $11/user/mo", "all", 9,
    ["Clean modern UX", "Multiple project views (board, list, timeline, calendar)", "Strong reporting and goals"],
    ["Pricing notable for larger teams", "Goals/reporting on higher tiers only", "Less customizable than ClickUp"],
    ["Tasks and projects", "Multiple views", "Goals", "Reporting", "Integrations"]),
  v("monday", "project-management", "monday.com", "https://monday.com", "Work OS for any team",
    "monday.com is a flexible work-OS platform that adapts to almost any workflow - project management, sales pipelines, HR, anything.",
    "monday.com is the most flexible of the major work platforms - adapts to almost any team's needs. Power can become complexity if not managed.",
    "paid", "$9/seat/mo (Basic)", "all", 8,
    ["Highly customizable", "Strong template library", "Multiple views and dashboards"],
    ["Can become messy without governance", "Per-seat minimums on plans", "Reporting less mature than Asana's"],
    ["Boards and dashboards", "Multiple views", "Automation", "Templates", "Integrations"]),
  v("clickup", "project-management", "ClickUp", "https://clickup.com", "Everything-in-one work platform",
    "ClickUp tries to be everything: tasks, docs, chat, goals, time tracking, and more in one platform - and largely succeeds.",
    "ClickUp packs the most features per dollar of any platform. Great if your team will use the breadth; overwhelming if you just need tasks.",
    "freemium", "$0 (free) or $7/user/mo", "smb", 8,
    ["Massive feature surface", "Aggressive pricing", "Free tier is genuinely usable"],
    ["UI can feel busy", "Reliability has had hiccups historically", "Onboarding takes time"],
    ["Tasks + docs + chat", "Multiple views", "Goals + dashboards", "Time tracking", "Integrations"]),
  v("notion", "project-management", "Notion", "https://www.notion.so", "Docs + databases + projects",
    "Notion is the modern wiki + database tool that doubles as a flexible project-management platform for many teams.",
    "Notion is unbeatable for teams that want their docs, wiki, and project tracking in one place. Less suited as a pure project tool, but for many teams it's enough.",
    "freemium", "$0 (free) or $10/user/mo", "smb", 8,
    ["Beautiful, flexible blocks model", "Docs + databases + projects", "Strong free tier"],
    ["Can become chaotic without structure", "Mobile UX weaker", "Limited automation depth"],
    ["Pages + blocks", "Databases", "Templates", "Wiki + docs", "AI features"]),
  v("linear", "project-management", "Linear", "https://linear.app", "Issue tracker for software teams",
    "Linear is the modern issue tracker that ate Jira's lunch with software teams - fast, opinionated, and deeply pleasant to use.",
    "Linear is the standard for modern software teams. Opinionated workflow, fast UI, strong roadmaps. Less suited for non-engineering teams.",
    "freemium", "$0 (free) or $8/user/mo", "smb", 9,
    ["Best-in-class UX and speed", "Opinionated workflow that works", "Strong roadmap and project tools"],
    ["Best fit only for software teams", "Smaller ecosystem than Jira", "Limited customization (by design)"],
    ["Issues + projects", "Roadmaps", "Cycles", "Triage", "Integrations"]),

  // HR software
  v("rippling", "hr-software", "Rippling", "https://www.rippling.com", "All-in-one HR + IT + payroll",
    "Rippling unifies HR, payroll, IT, and finance in one platform - powerful for SMBs that want a single system instead of many.",
    "Rippling is the most ambitious HRIS on the market: HR + payroll + IT (devices, apps, identity) in one platform. Best for SMBs replacing multiple tools.",
    "quote", undefined, "smb", 9,
    ["HR + IT + payroll in one", "Workflow automation across systems", "Modern UX"],
    ["Quote-only pricing", "Module-by-module add-ons can stack", "Implementation real for larger teams"],
    ["Payroll + benefits", "Onboarding + offboarding", "IT (devices + apps)", "Workflows", "Reporting"]),
  v("gusto", "hr-software", "Gusto", "https://gusto.com", "Payroll + HR for small businesses",
    "Gusto is the friendliest payroll + HR platform for small businesses - easy onboarding, transparent pricing, and a respected brand.",
    "Gusto is the easiest entry point to modern payroll for SMBs. Strong on transparent pricing and friendly UX. HR features less mature than Rippling.",
    "paid", "$40/mo + $6/employee", "smb", 9,
    ["Transparent per-employee pricing", "Easy onboarding", "Strong support"],
    ["HR/IT depth less than Rippling", "Less customizable for larger teams", "Reporting basic"],
    ["Payroll + tax", "Benefits administration", "Time tracking", "Onboarding", "HR support"]),
  v("bamboohr", "hr-software", "BambooHR", "https://www.bamboohr.com", "HR for growing businesses",
    "BambooHR is a long-running HRIS popular with growing SMBs - strong on people-ops features, less ambitious than Rippling on IT/finance.",
    "BambooHR has been the SMB HRIS standard for over a decade. Solid feature set, friendly UX, and a deep ATS for hiring.",
    "quote", undefined, "smb", 8,
    ["Mature HRIS feature set", "Strong ATS for hiring", "Friendly support"],
    ["Quote-only pricing", "Payroll added recently and still maturing", "Less unified than Rippling"],
    ["Employee records", "Time off + tracking", "Onboarding", "ATS (hiring)", "Reporting"]),
  v("paylocity", "hr-software", "Paylocity", "https://www.paylocity.com", "Payroll + HR for mid-market",
    "Paylocity is a popular payroll + HR platform for mid-market SMBs - more depth than Gusto, less unified than Rippling.",
    "Paylocity targets mid-market companies that have outgrown Gusto. Strong on payroll, benefits, and compliance; the UI is workmanlike rather than delightful.",
    "quote", undefined, "mid_market", 7,
    ["Solid payroll and compliance", "Mid-market depth", "Benefits administration"],
    ["UI feels enterprise-legacy", "Quote-only pricing", "Less modern than Rippling"],
    ["Payroll + tax", "Benefits administration", "HR + compliance", "Time and attendance", "Reporting"]),
  v("workday", "hr-software", "Workday HCM", "https://www.workday.com", "Enterprise HCM",
    "Workday is the enterprise HCM standard for large companies - finance, HR, and planning unified at scale.",
    "Workday is for enterprise. If you have 1,000+ employees and complex global operations, this is likely your platform. Implementation costs and timelines are real.",
    "quote", undefined, "enterprise", 8,
    ["Enterprise-scale HCM + finance", "Strong analytics and planning", "Industry-standard for large companies"],
    ["Implementation costs in the millions", "Major change effort", "Overkill for SMBs"],
    ["HCM (HR + payroll)", "Finance", "Planning + analytics", "Talent management", "API ecosystem"]),

  // Accounting software
  v("quickbooks-online", "accounting-software", "QuickBooks Online", "https://quickbooks.intuit.com", "Bookkeeping for SMBs",
    "QuickBooks Online is the dominant SMB accounting platform in North America - massive accountant ecosystem and broad integrations.",
    "QuickBooks Online is the default SMB accounting choice if your accountant uses it (and most do). Feature breadth and ecosystem are unmatched.",
    "paid", "$30/mo (Simple Start)", "smb", 9,
    ["Massive accountant ecosystem", "Broad integrations", "Mature, feature-rich"],
    ["Pricing climbs with features and seats", "UI feels legacy in places", "Customer support reviews mixed"],
    ["General ledger", "Invoicing + payments", "Expense tracking", "Reporting", "Payroll add-on"]),
  v("xero", "accounting-software", "Xero", "https://www.xero.com", "Cloud accounting for SMBs",
    "Xero is the strongest QuickBooks alternative globally - cleaner UX, strong outside North America.",
    "Xero is especially popular outside North America and with accounting firms that prefer cleaner UX. Feature parity with QBO; smaller US ecosystem.",
    "paid", "$15/mo (Early)", "smb", 9,
    ["Cleaner UX than QuickBooks", "Strong international footprint", "Aggressive pricing"],
    ["Smaller US accountant base", "Some advanced features behind higher tiers", "Inventory features lighter"],
    ["General ledger", "Invoicing + payments", "Bank reconciliation", "Reporting", "App marketplace"]),
  v("freshbooks", "accounting-software", "FreshBooks", "https://www.freshbooks.com", "Invoicing + accounting for service businesses",
    "FreshBooks targets service businesses and freelancers - invoicing-first, with accounting layered on top.",
    "FreshBooks is the invoicing-first accounting tool for service businesses. Easier than QBO for non-accountants; less suited for inventory-heavy operations.",
    "paid", "$19/mo", "smb", 8,
    ["Excellent invoicing UX", "Friendly for non-accountants", "Time tracking included"],
    ["Inventory features limited", "Less robust accounting depth than QBO", "Reporting basic"],
    ["Invoicing + payments", "Time tracking", "Expense tracking", "Reporting", "Client portal"]),
  v("wave", "accounting-software", "Wave Accounting", "https://www.waveapps.com", "Free accounting for solopreneurs",
    "Wave is the free accounting platform for freelancers and solo businesses - core bookkeeping at zero cost, paid for payments and payroll.",
    "Wave's free tier covers core bookkeeping for solo businesses. Payments and payroll are paid; pricing competitive but not the cheapest.",
    "freemium", "Free (paid for payments + payroll)", "smb", 7,
    ["Free core accounting", "Easy onboarding", "Solid for solos"],
    ["Limited as you scale", "Smaller ecosystem", "Reporting basic"],
    ["Bookkeeping", "Invoicing", "Payments (paid)", "Payroll (paid)", "Receipt scanning"]),
  v("netsuite", "accounting-software", "NetSuite ERP", "https://www.netsuite.com", "Cloud ERP for mid-market",
    "NetSuite is Oracle's cloud ERP - accounting plus much more, for mid-market companies that have outgrown SMB tools.",
    "NetSuite is what you graduate to when QBO/Xero stop working - financials, inventory, CRM, ecommerce in one ERP. Implementation is a real project.",
    "quote", undefined, "mid_market", 8,
    ["Comprehensive ERP suite", "Strong for multi-entity", "Industry-specific editions"],
    ["Implementation effort and cost real", "Overkill for true SMBs", "Quote-only pricing"],
    ["GL + financials", "Inventory + supply chain", "CRM", "Ecommerce", "Reporting + planning"]),

  // Ecommerce platforms
  v("shopify", "ecommerce-platforms", "Shopify", "https://www.shopify.com", "The dominant ecommerce platform",
    "Shopify is the dominant ecommerce platform for SMB and mid-market sellers - hosted SaaS, app store, and a strong ecosystem.",
    "Shopify is the easy answer for most SMB ecommerce. Hosted SaaS, massive app store, and Shopify Payments simplify the stack.",
    "paid", "$39/mo (Basic)", "smb", 9,
    ["Massive app + theme ecosystem", "Strong Shopify Payments rates", "Reliable infrastructure"],
    ["Customization limits beyond themes", "Shopify Payments lock-in for best rates", "Plus pricing climbs significantly"],
    ["Hosted storefront", "App store", "Shopify Payments", "Multi-channel selling", "Analytics"]),
  v("bigcommerce", "ecommerce-platforms", "BigCommerce", "https://www.bigcommerce.com", "Headless-friendly ecommerce for mid-market",
    "BigCommerce is the strongest Shopify alternative - more flexibility for mid-market and B2B sellers, with strong headless support.",
    "BigCommerce gives you more out-of-the-box for mid-market without the upgrade to Shopify Plus. Headless story is more mature.",
    "paid", "$39/mo (Standard)", "mid_market", 8,
    ["More B2B/mid-market features included", "Strong headless support", "No transaction fees on any plan"],
    ["Smaller app/theme ecosystem", "Brand recognition lower", "UX feels less polished than Shopify's"],
    ["Hosted storefront", "Headless option", "B2B features", "Multi-channel", "Reporting"]),
  v("woocommerce", "ecommerce-platforms", "WooCommerce", "https://woocommerce.com", "Open-source ecommerce on WordPress",
    "WooCommerce is the open-source ecommerce platform on WordPress - the most flexible option, but you own the hosting and stack.",
    "WooCommerce is for teams that want maximum flexibility on the WordPress stack. You own hosting, security, and updates - which is freedom or burden depending on the team.",
    "free", "Free (plugins and hosting paid)", "smb", 7,
    ["Maximum flexibility", "Free core software", "Massive WordPress plugin ecosystem"],
    ["You own hosting and security", "Performance depends on your stack", "Costs add up across plugins + hosting"],
    ["Open-source ecommerce", "WordPress integration", "Plugin ecosystem", "Customizable", "Multi-language"]),
  v("squarespace-commerce", "ecommerce-platforms", "Squarespace Commerce", "https://www.squarespace.com/ecommerce", "Ecommerce on Squarespace",
    "Squarespace Commerce is the ecommerce side of Squarespace - perfect for content-heavy or design-led brands selling online.",
    "Squarespace Commerce shines for design-led, content-heavy brands. Easier than Shopify for non-technical merchants; less powerful at high volume.",
    "paid", "$23/mo (Business)", "smb", 7,
    ["Best-in-class templates and design", "Easy for non-technical merchants", "Content + commerce in one"],
    ["Smaller app ecosystem than Shopify", "Less suited to high-SKU stores", "Reporting basic"],
    ["Storefront builder", "Inventory", "Payments", "Email marketing", "Analytics"]),
  v("salesforce-commerce-cloud", "ecommerce-platforms", "Salesforce Commerce Cloud", "https://www.salesforce.com/products/commerce-cloud", "Enterprise commerce",
    "Salesforce Commerce Cloud (formerly Demandware) is the enterprise ecommerce platform for large brands and B2B sellers.",
    "Commerce Cloud is for enterprise teams running complex global commerce - personalization, B2B, and unified Salesforce data. Implementation is a real undertaking.",
    "quote", undefined, "enterprise", 7,
    ["Enterprise scale and feature depth", "Unified Salesforce data", "Strong personalization"],
    ["Quote-only pricing in the high six figures", "Implementation is a multi-quarter project", "Overkill for SMBs"],
    ["B2C and B2B commerce", "Personalization", "Order management", "Salesforce integration", "Headless option"]),

  // Cybersecurity (SMB-mid-market focus)
  v("crowdstrike-falcon", "cybersecurity", "CrowdStrike Falcon", "https://www.crowdstrike.com", "Endpoint detection and response",
    "CrowdStrike Falcon is the EDR market leader - cloud-native endpoint protection trusted by enterprises and increasingly by mid-market.",
    "CrowdStrike Falcon is the gold standard in EDR. Strong threat intelligence and a low-overhead agent. Pricing tiers can be confusing.",
    "quote", undefined, "mid_market", 9,
    ["Industry-leading detection and threat intel", "Cloud-native, low-overhead agent", "Strong MDR add-on"],
    ["Quote-only pricing", "Module pricing can stack", "Overkill for the smallest teams"],
    ["EDR + XDR", "Threat hunting", "Identity protection", "Cloud workload protection", "Managed detection"]),
  v("sentinelone", "cybersecurity", "SentinelOne Singularity", "https://www.sentinelone.com", "Autonomous endpoint protection",
    "SentinelOne is one of the strongest EDR alternatives to CrowdStrike, with a focus on AI-driven autonomous response.",
    "SentinelOne is a strong CrowdStrike alternative - especially for teams that value AI-driven autonomous response and slightly more transparent pricing.",
    "quote", undefined, "mid_market", 8,
    ["AI-driven response", "Strong endpoint protection", "Often more transparent pricing than CrowdStrike"],
    ["Smaller threat-intel network than CrowdStrike", "Module add-ons stack up", "Less name recognition"],
    ["EDR + XDR", "Identity protection", "Cloud workload protection", "Threat hunting", "Automation"]),
  v("microsoft-defender", "cybersecurity", "Microsoft Defender for Business", "https://www.microsoft.com/security/business/endpoint-security", "Endpoint security from Microsoft 365",
    "Microsoft Defender for Business bundles enterprise-grade endpoint security into Microsoft 365 plans - a no-brainer for Microsoft shops.",
    "Defender is the easy choice if you're already on Microsoft 365 Business Premium. Threat protection is competitive; setup easier when integrated with the rest of M365.",
    "paid", "Included in M365 Business Premium", "smb", 8,
    ["Bundled with M365 Business Premium", "Strong integration with M365 stack", "Microsoft scale on threat intel"],
    ["Tighter to M365 ecosystem", "Cross-platform coverage less mature than CrowdStrike's", "Configuration depth varies by plan"],
    ["Endpoint protection", "Vulnerability management", "Threat investigation", "M365 integration", "Cross-platform support"]),
  v("okta", "cybersecurity", "Okta", "https://www.okta.com", "Identity and access management",
    "Okta is the identity-and-access standard for enterprises - SSO, MFA, lifecycle management, and a vast app catalog.",
    "Okta is the IAM market leader. Strong app catalog, mature MFA, and a real ecosystem. Pricing notable; SMBs may prefer cheaper options.",
    "quote", undefined, "mid_market", 9,
    ["Massive app catalog and integrations", "Mature MFA and SSO", "Lifecycle management strong"],
    ["Pricing climbs with features and users", "Overkill for very small teams", "Recent breaches affected reputation"],
    ["SSO and MFA", "Lifecycle management", "Identity governance", "Adaptive auth", "API + integrations"]),
  v("1password-business", "cybersecurity", "1Password Business", "https://1password.com/business", "Password management for teams",
    "1Password Business is the password manager standard for modern teams - strong UX, secrets management, and developer tooling.",
    "1Password is the easy team password manager pick. Strong UX, expanding into secrets management for engineering teams. Pricing fair.",
    "paid", "$8/user/mo", "smb", 9,
    ["Best-in-class UX", "Expanding into secrets management", "Strong sharing and group features"],
    ["Smaller enterprise feature surface than enterprise IAM", "Reporting less mature than enterprise tools", "Pricing per user adds up at scale"],
    ["Team vaults", "Secrets management", "SSO integration", "Recovery", "Developer tools"]),

  // Survey tools
  v("typeform", "survey-tools", "Typeform", "https://www.typeform.com", "Conversational forms and surveys",
    "Typeform is the modern, conversational survey and form platform - beautiful UX that drives higher completion than traditional forms.",
    "Typeform's one-question-at-a-time UX consistently delivers higher completion rates. Premium pricing reflects the polish.",
    "freemium", "$0 (free) or $25/mo", "smb", 9,
    ["Beautiful, completion-friendly UX", "Strong logic + branching", "Solid integrations"],
    ["Premium pricing", "Less suited for traditional enterprise NPS", "Question-at-a-time UX not for everyone"],
    ["Forms + surveys", "Conditional logic", "Quizzes", "Integrations", "Analytics"]),
  v("surveymonkey", "survey-tools", "SurveyMonkey", "https://www.surveymonkey.com", "The classic survey tool",
    "SurveyMonkey is the legacy survey platform that's still strong for traditional research and HR-driven surveys.",
    "SurveyMonkey covers traditional survey use cases reliably. UX feels older than Typeform's; analytics depth is solid for the price.",
    "freemium", "$0 (free) or $25/mo", "smb", 7,
    ["Mature, reliable platform", "Strong analytics for research", "Wide template library"],
    ["UX feels dated", "Pricing per-user climbs", "Less polished than Typeform"],
    ["Surveys", "Question logic", "Analytics + reporting", "Templates", "Integrations"]),
  v("qualtrics", "survey-tools", "Qualtrics XM", "https://www.qualtrics.com", "Enterprise experience management",
    "Qualtrics is the enterprise standard for experience management (CX, EX, brand, product) - far beyond simple surveys.",
    "Qualtrics is the premium choice for serious experience programs at enterprise scale. Pricing reflects the power and the implementation effort.",
    "quote", undefined, "enterprise", 8,
    ["Industry-leading depth for enterprise XM", "Strong text analytics + AI", "Comprehensive experience programs"],
    ["Quote-only enterprise pricing", "Implementation is a real project", "Overkill for SMB use cases"],
    ["CX + EX programs", "Text analytics", "Driver analysis", "Distribution", "Reporting and dashboards"]),
  v("jotform", "survey-tools", "Jotform", "https://www.jotform.com", "Forms for everything",
    "Jotform is the do-everything form builder - surveys, intake, payments, signatures, and HR forms.",
    "Jotform is a strong all-purpose form builder with a generous free tier. Less polished than Typeform but covers more use cases.",
    "freemium", "$0 (free) or $34/mo", "smb", 8,
    ["Massive feature surface (forms, payments, signatures)", "Generous free tier", "Wide template library"],
    ["UX feels dated in places", "Pricing scales with submissions", "Less polished than Typeform"],
    ["Forms + surveys", "Payments", "E-signature", "Workflow", "Reports"]),
  v("formstack", "survey-tools", "Formstack", "https://www.formstack.com", "Forms + workflows for the enterprise",
    "Formstack is a forms and workflow platform for mid-market and enterprise teams - strong on data routing, approvals, and compliance.",
    "Formstack targets compliance-heavy industries (healthcare, finance) that need forms with audit trails and complex routing. Less consumer-y than Typeform.",
    "quote", undefined, "mid_market", 7,
    ["Strong workflow + routing", "Compliance features (HIPAA, etc.)", "Document generation"],
    ["Quote-based pricing", "UX more enterprise than modern", "Pricing notable"],
    ["Forms + surveys", "Workflows + approvals", "Documents", "Sign + payments", "Compliance"]),

  // E-Signature
  v("docusign", "esignature", "DocuSign", "https://www.docusign.com", "The e-signature standard",
    "DocuSign is the global e-signature standard - largest brand, deepest integrations, and broadest legal recognition.",
    "DocuSign is the safe enterprise pick. Most legal teams already trust it; integrations everywhere. Pricing climbs with envelopes and seats.",
    "paid", "$10/mo (Personal) or $25/user/mo (Standard)", "all", 9,
    ["Most trusted e-signature brand", "Massive integration ecosystem", "Strong legal compliance globally"],
    ["Pricing per envelope tier confusing", "Per-seat costs add up", "UX has been improving slowly"],
    ["E-signatures", "Templates", "Audit trail", "API + integrations", "Reporting"]),
  v("dropbox-sign", "esignature", "Dropbox Sign (HelloSign)", "https://sign.dropbox.com", "E-signature from Dropbox",
    "Dropbox Sign (formerly HelloSign) is a clean e-signature platform with strong Google Workspace and Dropbox integration.",
    "Dropbox Sign is a strong DocuSign alternative for SMBs that don't need enterprise features. Better pricing for high-volume small teams.",
    "freemium", "$0 (3 free) or $20/user/mo", "smb", 8,
    ["Clean modern UX", "Strong Google Workspace integration", "Aggressive pricing"],
    ["Smaller integration ecosystem than DocuSign", "Less enterprise depth", "Brand recognition lower"],
    ["E-signatures", "Templates", "Audit trail", "Google integration", "API"]),
  v("pandadoc", "esignature", "PandaDoc", "https://www.pandadoc.com", "Document workflow + e-signature",
    "PandaDoc is more than e-signature - document creation, workflow, and CPQ for sales teams.",
    "PandaDoc is the right pick for sales teams that need proposals + e-signature in one platform. Less of a fit for HR/legal-only e-sign needs.",
    "freemium", "$0 (free e-sign) or $19/user/mo", "smb", 8,
    ["Document creation + e-sign in one", "Strong CPQ features", "Templates and reusable blocks"],
    ["More than e-sign (which can be overkill)", "Pricing climbs with seats", "Less recognizable than DocuSign in legal"],
    ["E-signatures", "Document creation", "CPQ", "Workflow", "Integrations"]),
  v("adobe-acrobat-sign", "esignature", "Adobe Acrobat Sign", "https://www.adobe.com/sign.html", "E-signature from Adobe",
    "Adobe Acrobat Sign is the e-signature platform from Adobe - tightly integrated with the Acrobat PDF ecosystem.",
    "Acrobat Sign makes most sense for teams already on Acrobat or Creative Cloud. Strong PDF tools and global recognition; UX less modern than dedicated e-sign tools.",
    "paid", "$15/mo or bundled with Creative Cloud", "all", 7,
    ["Strong PDF + Acrobat integration", "Adobe brand and global compliance", "Enterprise-grade if already on Adobe"],
    ["UX feels enterprise rather than modern", "Pricing structure complex", "Less e-sign-specific than DocuSign"],
    ["E-signatures", "Acrobat integration", "Templates", "Audit trails", "Bulk send"]),
  v("signnow", "esignature", "signNow", "https://www.signnow.com", "Affordable e-signature",
    "signNow is one of the most affordable e-signature platforms with a solid feature set and decent integrations.",
    "signNow undercuts DocuSign on price while covering core e-signature needs. Smaller ecosystem and less enterprise polish.",
    "paid", "$8/user/mo", "smb", 7,
    ["Aggressive pricing", "Solid core feature set", "Decent integrations"],
    ["Smaller integration ecosystem", "UX less polished", "Brand recognition lower"],
    ["E-signatures", "Templates", "Audit trail", "Integrations", "Bulk send"]),

  // Live Chat & Customer Messaging
  v("intercom-messenger", "live-chat", "Intercom Messenger", "https://www.intercom.com/customer-messenger", "Customer messenger from Intercom",
    "Intercom Messenger is the live chat + customer messaging product from Intercom, with deep AI agent capabilities.",
    "Intercom Messenger blurs sales chat and support. Strong AI deflection (Fin); ideal for product-led companies that want chat-first support.",
    "paid", "$39/seat/mo + Fin pricing", "smb", 8,
    ["Strong chat + AI agent (Fin)", "Tightly integrated with help center", "Modern UX"],
    ["Pricing notable for marketing-led use cases", "AI deflection priced per resolution", "Reporting less mature than Zendesk"],
    ["Live chat + Messenger", "AI agent (Fin)", "Triggered messages", "Inbox", "Reporting"]),
  v("drift", "live-chat", "Drift", "https://www.drift.com", "Conversational marketing and sales chat",
    "Drift pioneered conversational marketing - chat for B2B sales and marketing teams.",
    "Drift focuses on B2B sales/marketing chat with strong account targeting. Less of a support tool than Intercom; more sales-led.",
    "quote", undefined, "mid_market", 7,
    ["Strong B2B sales/marketing focus", "Account-based targeting", "Conversational landing pages"],
    ["Quote-only pricing", "Less suited for support/CX use cases", "Smaller than Intercom in B2C"],
    ["Live chat", "Account-based targeting", "Bots and playbooks", "Meeting scheduling", "Integrations"]),
  v("crisp", "live-chat", "Crisp", "https://crisp.chat", "Affordable team inbox and chat",
    "Crisp is an affordable customer messaging platform with chat, helpdesk, and CRM features in a single tool.",
    "Crisp is a strong value play - chat + shared inbox + CRM for SMBs at much lower prices than Intercom.",
    "freemium", "$0 (free) or $25/mo", "smb", 8,
    ["Aggressive pricing for the breadth", "Chat + helpdesk + CRM in one", "Decent free tier"],
    ["Smaller integration ecosystem", "AI features less developed", "Brand recognition lower"],
    ["Live chat", "Shared inbox", "Light CRM", "Triggers", "Bots"]),
  v("tawk", "live-chat", "tawk.to", "https://www.tawk.to", "Free live chat for websites",
    "tawk.to is a free live chat tool that monetizes through paid agents and add-ons - popular with SMBs that need chat at zero cost.",
    "tawk.to is genuinely free for unlimited chats. Quality and feature depth are below paid tools, but for teams just starting it works.",
    "free", "Free", "smb", 6,
    ["Genuinely free", "Easy to install", "Mobile apps included"],
    ["Lower polish than paid tools", "Limited automation", "Monetized via paid add-ons"],
    ["Live chat", "Mobile apps", "Knowledge base", "Triggers", "Integrations"]),
  v("zendesk-chat", "live-chat", "Zendesk Messaging", "https://www.zendesk.com/service/messaging", "Messaging in Zendesk",
    "Zendesk Messaging is the chat product within Zendesk's service platform - tightly integrated with tickets and knowledge base.",
    "If you're already on Zendesk for support, Messaging is the obvious choice. Less competitive as a standalone chat product against Intercom or Drift.",
    "paid", "$25/agent/mo (with Suite)", "mid_market", 7,
    ["Tight Zendesk integration", "Mature reporting", "Strong omnichannel story"],
    ["Pricing tied to Zendesk Suite", "Less product-led than Intercom", "UX feels enterprise"],
    ["Live chat + messaging", "Bots", "Knowledge base integration", "Reporting", "Omnichannel"]),

  // Analytics platforms
  v("amplitude", "analytics-platforms", "Amplitude", "https://amplitude.com", "Product analytics for B2C and B2B",
    "Amplitude is one of the leading product analytics platforms - event tracking, funnels, retention, and segmentation depth.",
    "Amplitude is the modern product analytics standard. Great for understanding user behavior and growth; pricing climbs with event volume.",
    "freemium", "$0 (Starter) or quote", "smb", 9,
    ["Strong product analytics depth", "Generous free tier", "Solid SQL + dashboard tooling"],
    ["Pricing scales with events", "Implementation requires careful event design", "Less suited for marketing/web analytics"],
    ["Event tracking", "Funnels + retention", "Segmentation", "Dashboards", "Cohorts + experiments"]),
  v("mixpanel", "analytics-platforms", "Mixpanel", "https://mixpanel.com", "Product analytics and event tracking",
    "Mixpanel is the long-running product analytics tool - especially strong for B2C and consumer apps.",
    "Mixpanel pioneered event-based product analytics. Slightly more focused on consumer/B2C than Amplitude; generous free tier.",
    "freemium", "$0 (free) or $24/mo", "smb", 8,
    ["Generous free tier", "Strong B2C product analytics", "Clean modern UX"],
    ["Less suited for B2B than Amplitude", "Pricing scales with events", "Smaller community than Amplitude's"],
    ["Event tracking", "Funnels + retention", "Notebooks", "Cohorts", "Reporting"]),
  v("posthog", "analytics-platforms", "PostHog", "https://posthog.com", "Open-source product analytics",
    "PostHog is the open-source product analytics platform - product analytics + session replay + feature flags + A/B in one.",
    "PostHog is the do-everything platform for product teams that want analytics + experimentation + replay. Open-source means self-hosting is an option.",
    "freemium", "$0 (free) or usage-based", "smb", 9,
    ["Analytics + replay + flags + A/B in one", "Open-source / self-host option", "Aggressive pricing"],
    ["Newer brand than Amplitude/Mixpanel", "Self-hosting carries operational cost", "UX still maturing in some areas"],
    ["Event tracking + analytics", "Session replay", "Feature flags + A/B", "Surveys", "Dashboards"]),
  v("google-analytics-4", "analytics-platforms", "Google Analytics 4", "https://analytics.google.com", "Web analytics from Google",
    "Google Analytics 4 (GA4) is the default web analytics platform - free, ubiquitous, and increasingly product-analytics-focused.",
    "GA4 is the default web analytics layer for any site. Free for most volumes; reporting model takes adjustment from Universal Analytics.",
    "free", "Free (paid 360 for enterprise)", "all", 7,
    ["Free for most teams", "Ubiquitous and well-supported", "Increasingly event-centric"],
    ["UX confusing post-GA4 migration", "Less product-focused than Amplitude/Mixpanel", "Privacy + cookie issues"],
    ["Web analytics", "Event tracking", "Audience building", "Google Ads integration", "BigQuery export"]),
  v("looker", "analytics-platforms", "Looker (Google Cloud)", "https://looker.com", "Modern BI on the modern data stack",
    "Looker is Google Cloud's modern BI platform - strong on the modern data stack (warehouse-first, LookML modeling).",
    "Looker is for teams that want a real BI platform on top of their warehouse. Implementation effort is real (LookML), but the long-term consistency benefits are strong.",
    "quote", undefined, "mid_market", 8,
    ["Warehouse-native BI model", "Strong governance via LookML", "Google Cloud ecosystem"],
    ["Implementation effort real", "Pricing notable", "Less drag-and-drop than Tableau/PBI"],
    ["LookML data modeling", "Dashboards + explores", "Embedded analytics", "BigQuery integration", "Looker Studio"]),
];

function v(
  slug: string,
  categorySlug: string,
  name: string,
  websiteUrl: string,
  tagline: string,
  descriptionShort: string,
  descriptionLong: string,
  pricingModel: V["pricingModel"],
  pricingStartingAt: string | undefined,
  bestForSegment: V["bestForSegment"],
  ourScore: number,
  pros: string[],
  cons: string[],
  keyFeatures: string[],
): V {
  return {
    slug,
    categorySlug,
    name,
    websiteUrl,
    tagline,
    descriptionShort,
    descriptionLong,
    pricingModel,
    pricingStartingAt,
    bestForSegment,
    ourScore,
    pros,
    cons,
    keyFeatures,
  };
}

const buyerGuides: { categorySlug: string; slug: string; title: string; bodyMarkdown: string }[] = [
  { categorySlug: "marketing-automation", slug: "marketing-automation-buyers-guide", title: "Choosing a marketing automation platform", bodyMarkdown: "## What this guide covers\n\nMarketing automation pricing is opaque and the categories overlap. This guide walks through what to actually pay for, when HubSpot vs ActiveCampaign vs Klaviyo wins, and the most common buying mistakes.\n\n*Full content lands as part of the M6 content pipeline.*" },
  { categorySlug: "email-marketing", slug: "email-marketing-buyers-guide", title: "Choosing email marketing software", bodyMarkdown: "## What this guide covers\n\nEmail marketing covers everything from $0 newsletters to enterprise lifecycle programs. This guide explains the right tool for each stage and where the lines between email and full marketing automation actually fall.\n\n*Full content lands as part of the M6 content pipeline.*" },
  { categorySlug: "help-desk-software", slug: "help-desk-buyers-guide", title: "Choosing help desk software", bodyMarkdown: "## What this guide covers\n\nThe help desk market splits between traditional ticketing (Zendesk, Freshdesk) and product-led messaging (Intercom). This guide explains who wins for which support model.\n\n*Full content lands as part of the M6 content pipeline.*" },
  { categorySlug: "project-management", slug: "project-management-buyers-guide", title: "Choosing project management software", bodyMarkdown: "## What this guide covers\n\nThe right project management tool depends on team size, technical depth, and the kinds of work you ship. This guide walks through Asana vs monday vs ClickUp vs Linear vs Notion and where each wins.\n\n*Full content lands as part of the M6 content pipeline.*" },
  { categorySlug: "hr-software", slug: "hr-software-buyers-guide", title: "Choosing HR software", bodyMarkdown: "## What this guide covers\n\nHR software covers payroll, benefits, onboarding, and compliance. Rippling vs Gusto vs BambooHR vs Workday split sharply by company size and complexity.\n\n*Full content lands as part of the M6 content pipeline.*" },
  { categorySlug: "accounting-software", slug: "accounting-software-buyers-guide", title: "Choosing accounting software", bodyMarkdown: "## What this guide covers\n\nQuickBooks dominates US SMB accounting, but Xero has caught up internationally. NetSuite is the graduation step. This guide explains the trade-offs and the right time to switch.\n\n*Full content lands as part of the M6 content pipeline.*" },
  { categorySlug: "ecommerce-platforms", slug: "ecommerce-platforms-buyers-guide", title: "Choosing an ecommerce platform", bodyMarkdown: "## What this guide covers\n\nShopify owns SMB ecommerce, but BigCommerce, WooCommerce, Squarespace, and Salesforce Commerce Cloud each fit specific cases. This guide explains who wins for which seller.\n\n*Full content lands as part of the M6 content pipeline.*" },
  { categorySlug: "cybersecurity", slug: "cybersecurity-buyers-guide", title: "SMB cybersecurity buyer's guide", bodyMarkdown: "## What this guide covers\n\nSMB cybersecurity has gotten cheaper and more capable. CrowdStrike, SentinelOne, and Microsoft Defender all serve mid-market well. This guide explains where each wins.\n\n*Full content lands as part of the M6 content pipeline.*" },
  { categorySlug: "survey-tools", slug: "survey-tools-buyers-guide", title: "Choosing survey software", bodyMarkdown: "## What this guide covers\n\nTypeform vs SurveyMonkey vs Qualtrics fits different research scales. This guide explains the trade-offs and when to pay for serious experience programs.\n\n*Full content lands as part of the M6 content pipeline.*" },
  { categorySlug: "esignature", slug: "esignature-buyers-guide", title: "Choosing e-signature software", bodyMarkdown: "## What this guide covers\n\nDocuSign is the safe pick, but Dropbox Sign, PandaDoc, and signNow each save real money for specific use cases. This guide explains the trade-offs.\n\n*Full content lands as part of the M6 content pipeline.*" },
  { categorySlug: "live-chat", slug: "live-chat-buyers-guide", title: "Choosing live chat software", bodyMarkdown: "## What this guide covers\n\nLive chat splits between sales chat (Drift), product-led chat (Intercom), and value players (Crisp, tawk.to). This guide explains where each fits.\n\n*Full content lands as part of the M6 content pipeline.*" },
  { categorySlug: "analytics-platforms", slug: "analytics-platforms-buyers-guide", title: "Choosing an analytics platform", bodyMarkdown: "## What this guide covers\n\nAmplitude vs Mixpanel vs PostHog vs GA4 vs Looker - each wins for different team types. This guide walks through who picks what and why.\n\n*Full content lands as part of the M6 content pipeline.*" },
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
  for (const ven of vendors) {
    const category = await db.category.findUnique({
      where: { slug: ven.categorySlug },
    });
    if (!category) throw new Error(`Missing category: ${ven.categorySlug}`);
    await db.vendor.upsert({
      where: { slug: ven.slug },
      update: {
        name: ven.name,
        websiteUrl: ven.websiteUrl,
        categoryId: category.id,
        tagline: ven.tagline,
        descriptionShort: ven.descriptionShort,
        descriptionLong: ven.descriptionLong,
        pricingModel: ven.pricingModel,
        pricingStartingAt: ven.pricingStartingAt ?? null,
        bestForSegment: ven.bestForSegment,
        ourScore: ven.ourScore,
        pros: ven.pros,
        cons: ven.cons,
        keyFeatures: ven.keyFeatures,
        status: "published",
      },
      create: {
        slug: ven.slug,
        name: ven.name,
        websiteUrl: ven.websiteUrl,
        categoryId: category.id,
        tagline: ven.tagline,
        descriptionShort: ven.descriptionShort,
        descriptionLong: ven.descriptionLong,
        pricingModel: ven.pricingModel,
        pricingStartingAt: ven.pricingStartingAt ?? null,
        bestForSegment: ven.bestForSegment,
        ourScore: ven.ourScore,
        pros: ven.pros,
        cons: ven.cons,
        keyFeatures: ven.keyFeatures,
        status: "published",
      },
    });
    console.log(`  ${ven.categorySlug}/${ven.slug}`);
  }

  console.log("Seeding buyer guides...");
  for (const g of buyerGuides) {
    const category = await db.category.findUnique({ where: { slug: g.categorySlug } });
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
