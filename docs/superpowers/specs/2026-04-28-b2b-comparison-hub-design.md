# B2B Comparison Hub - Phase 1 Design

**Date:** 2026-04-28
**Status:** Approved (sections 1-8) - pending user review of full document
**Owner:** Bar Elezra
**Working name:** "the hub" (brand/domain TBD)

---

## 1. Project Summary

A B2B software/services comparison hub for SMB and mid-market buyers, modeled on G2 / Capterra but vertical-focused. Phase 1 is an SEO-first content site with lead capture, manual sponsorship management, and reserved ad slots. Phase 2 (separate spec, later) layers vendor self-serve, billing automation, and user reviews.

**Six launch categories:** debt collection software, business funding software (MCA), merchant services, POS systems, PEO services, CRM software. These are picked because (a) G2 is weak in most of them and (b) they share a buyer (SMB/MM operations leader), enabling cross-linking and topical authority.

**Three monetization streams, layered:**
1. Lead generation (highest value per visitor) - capture leads on commercial pages, route to vendors via email
2. Sponsored placements (sold manually outside the site) - featured slots, rank boosts, FTC-disclosed badges
3. Display ads (passive floor) - AdSense slots reserved on educational pages only

**Target scale at launch:** ~480 pages of content (6 categories × ~80 pages each).

---

## 2. Foundation

### 2.1 Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | PostgreSQL via Prisma |
| Hosting | Railway (push-to-main deploys) |
| Email | Resend or Postmark (transactional) |
| Anti-bot | Cloudflare Turnstile |
| Auth (admin only) | NextAuth or basic JWT, single user |
| AI generation | Claude Haiku 4.5 via existing Anthropic API key |
| Display ads | Google AdSense (Mediavine when ~50K MAU) |

This matches the Coastal CMS / Poker Hub / Mirai Advisor stack already in use.

### 2.2 URL Structure

```
/                                      homepage (search + featured categories)
/[category]                            category overview
/[category]/best                       top-N list
/[category]/buyers-guide               buyer guide
/[category]/[vendor]                   vendor profile
/[category]/[vendor]-alternatives      alternatives page
/compare/[vendor-a]-vs-[vendor-b]      vs comparison (cross-category allowed)
/admin/*                               admin panel
```

### 2.3 Launch Category Slugs

- `/debt-collection-software`
- `/business-funding-software`
- `/merchant-services`
- `/pos-systems`
- `/peo-services`
- `/crm-software`

---

## 3. Data Model

Prisma/Postgres schema. Phase 1 only - no public users, no review tables yet.

```
Category
  id, slug, name, description, icon, heroImage
  seoTitle, seoDescription
  sortOrder, isActive
  has many: Vendor, BuyerGuide

Vendor
  id, slug, name, logoUrl, websiteUrl
  categoryId (FK)
  tagline, descriptionShort, descriptionLong (markdown)
  foundedYear, hqLocation, employeeCountRange
  pricingModel (enum: free | freemium | paid | quote)
  pricingStartingAt, pricingNotes
  bestForSegment (enum: smb | mid_market | enterprise | all)
  ourScore (1-10, editorial), ourScoreNotes
  pros (string[]), cons (string[])
  keyFeatures (string[]), integrations (string[])
  isClaimed (bool - Phase 2 hook), isPaidSponsor (bool)
  sponsorTier (enum: none | featured | premium), sponsorRankBoost (int)
  leadFormEnabled (bool), leadDestination (email or webhook URL)
  affiliateUrl (nullable - outbound clicks if no lead form)
  status (enum: draft | published)
  createdAt, updatedAt
  has many: VendorScreenshot, Comparison (as A or B)

VendorScreenshot
  id, vendorId, url, caption, sortOrder

Comparison
  id, slug (a-vs-b), vendorAId, vendorBId
  hookCopy, summaryCopy, verdictCopy (markdown)
  isPublished
  unique(vendorAId, vendorBId)

BuyerGuide
  id, categoryId, slug, title
  bodyMarkdown, tableOfContents (json)
  isPublished

Lead
  id, vendorId (nullable - category-level leads), categoryId
  pagePath
  contactName, contactEmail, contactPhone, companyName, companySize
  intent (enum: evaluating | ready_to_buy | just_looking)
  message
  status (enum: new | sent_to_vendor | qualified | disqualified)
  vendorEmailSentAt, internalNotes
  utmSource, utmMedium, utmCampaign, gclid, referrer, ipHash
  createdAt

SponsoredPlacement
  id, vendorId, categoryId (or "all"), placementType (top_of_category | featured_compare | sidebar)
  startsAt, endsAt, monthlyRate
  isActive
  notes

AdminUser
  id, email, passwordHash, role
```

**Key design choices:**

- **`ourScore` is editorial, not computed.** Phase 1 has no user reviews. We score 1-10 based on research (Wirecutter/PCMag model). Phase 2 adds `userScore` separately; both display side by side.
- **`sponsorRankBoost`** lets sponsored vendors rank higher in lists transparently - visible "Sponsored" badge always shown. FTC-clean disclosure.

---

## 4. Page Templates & Rendering

### 4.1 Rendering Strategy

Next.js App Router with ISR (`revalidate: 3600`). Pages regenerate hourly. Editing in admin triggers `revalidatePath()` for affected routes so changes go live within ~1 second. Static enough for SEO, dynamic enough for sponsored slot updates.

### 4.2 Page Types

**1. Category overview** - `/[category]`
- Hero (name, what it is, who it's for, "X vendors compared" stat)
- "How we evaluate" trust block linking to methodology
- Featured vendors row (top 3 sponsored, "Sponsored" badge)
- Full vendor grid sorted by `displayRank` (see ranking logic)
- Buyer guide CTA box
- Top comparisons in this category
- FAQ (5-7 schema.org FAQPage Q&As)
- Lead form (category-scoped)

**2. Top-N list** - `/[category]/best`
- "Best [category] software in 2026" hero
- Numbered list 1-10 with rank, score, logo, who-it's-best-for, pricing, pros/cons, CTAs
- Methodology box at top
- Max 1 sponsored slot in top 5, badged
- FAQ + lead form

**3. Vendor profile** - `/[category]/[vendor]`
- Hero (logo, name, tagline, ourScore, "Visit website" + "Get pricing" CTAs)
- At-a-glance card (pricing, best-for, founded, HQ, employees)
- Long description
- Key features
- Pros / Cons two-column
- Screenshots gallery
- "How [vendor] compares" - auto-generated row of 3-5 closest competitors
- Integrations
- FAQs
- Sticky lead form (right on desktop, bottom on mobile)

**4. Vs comparison** - `/compare/[vendor-a]-vs-[vendor-b]`
- Side-by-side hero (two logos, two scores)
- "Quick verdict" editorial box (2-3 sentences)
- Comparison table (rows = features, columns = vendors, ✓/✗/partial)
- Pros/cons side-by-side
- "Choose [A] if..." / "Choose [B] if..." block
- Two CTAs side-by-side, each routing to its vendor's lead form
- Related comparisons row

**5. Alternatives** - `/[category]/[vendor]-alternatives`
- "Looking for an alternative to [vendor]? Here are the top 8."
- 8 alternatives with mini comparison vs the named vendor
- Why-people-leave editorial block
- Lead form (category-scoped)

**6. Buyer guide** - `/[category]/buyers-guide`
- 2,500-4,000 word long-form
- ToC sticky sidebar
- Mid-content lead form
- Schema.org Article markup

### 4.3 Ranking Logic

```
displayRank = ourScore + (sponsorRankBoost if sponsored else 0)
```

Sponsored vendors can boost up to 2 points. Sponsored badge always visible. Vendors with `ourScore < 6` never appear in top-10 lists regardless of sponsorship - protects credibility.

---

## 5. Content Generation Pipeline

The make-or-break section. ~480 pages of credible content via a hybrid pipeline.

### 5.1 Step 1 - Vendor research & data ingestion

Per category, build seed list of 20-30 vendors. Sources:
- G2/Capterra/SoftwareAdvice category pages (names + websites only)
- Industry directories (e.g. ACA International for debt collection)
- Reddit / industry forums for "what do you use" threads
- Bar's domain knowledge for debt/MCA categories

Per vendor, structured data fetched via `scripts/research-vendor.ts`:
- Vendor website (about, pricing, features) via headless browser
- Public sources (Crunchbase, LinkedIn) for HQ, founded, employee count
- Pricing screenshots if visible

Output: a structured factual record per vendor in the DB. No copy yet.

### 5.2 Step 2 - AI-generated copy

`scripts/generate-vendor-copy.ts` reads the structured record and uses Claude Haiku 4.5 to produce:
- `descriptionShort` (1-2 sentences)
- `descriptionLong` (4-6 paragraphs)
- `pros` / `cons` (3-5 each, grounded in real reviews scraped from G2/Reddit)
- `keyFeatures` summary
- `ourScoreNotes` (justifying the editorial score)

Same script generates **comparison copy** (A vs B) and **alternatives copy** by reading both vendors' structured records.

**Buyer guides** use a multi-step prompt: outline → section-by-section → assembly. ~3,000 words each.

**No em dashes** - generation prompts forbid them, post-process strips any that slip through.

### 5.3 Step 3 - Editorial review

Every page status defaults to `draft`. Admin shows a draft queue. Bar spot-checks 100% of category overviews + buyer guides + top-10 pages, ~20% of vendor profiles. Comparison/alternatives pages auto-publish once both source vendors are published.

### 5.4 Step 4 - Ongoing additions

After launch, vendors are added via admin: paste a website URL → triggers research script → fills structured data → triggers copy generation → lands in draft queue.

### 5.5 Risk

Google's helpful-content updates penalize obvious AI content. Mitigations:
- Editorial scores are real (Bar assigns)
- Pros/cons grounded in scraped real reviews
- Page templates distinctive (not the same paragraph order as G2)
- MCA Guide already proves this approach can rank

---

## 6. Lead Capture & Routing

### 6.1 Form Variants

Same component, different scope:
- **Vendor-scoped** (vendor profile, vs page) → `vendorId` set, lead routed to that vendor
- **Category-scoped** (category page, top-N, buyer guide) → `categoryId` only, manual match initially

### 6.2 Fields

5 fields max (more = lower conversion):
- Full name, work email, phone (optional), company name, company size dropdown
- Optional free-text "what are you looking for?"
- Hidden: pagePath, utm params, gclid, referrer, hashed IP

### 6.3 Submission Flow

1. Client-side validation (email format, phone format, required fields)
2. POST to `/api/leads` Next.js route handler
3. Server validates and applies anti-spam (see 6.5)
4. Insert `Lead` row with `status: 'new'`
5. Send transactional emails:
   - To vendor (if `leadDestination` set) - formatted, reply-to = lead email
   - To Bar - internal notification with admin link
   - To lead - confirmation, sets expectation
6. Update `lead.status = 'sent_to_vendor'` and `vendorEmailSentAt`
7. Show thank-you page with related content

### 6.4 Vendor Matching for Category-Scoped Leads

Phase 1: lands in admin inbox, Bar forwards manually (or one-click "match to vendor" button that triggers email send).
Future (Phase 2): auto-route to top 3 sponsored vendors in the category.

### 6.5 Anti-Abuse Stack

In order of friction:
1. Honeypot field (zero-friction, blocks dumb bots)
2. Cloudflare Turnstile
3. Email + phone format validation
4. Disposable email blocklist (~3000 domains)
5. Rate limit per IP (5 leads / hour)
6. Manual review for suspicious patterns (admin flag)

### 6.6 Tracking

- `gclid` captured from URL → stored on Lead → enables Google Ads offline conversion uploads later (same pattern as Mirai)
- UTM params captured for source attribution
- IP hashed (SHA-256) for rate limiting and dupe detection only

---

## 7. Sponsored Placements + Display Ads

### 7.1 Sponsorship Tiers (sold and billed manually outside the site)

| Tier | What vendor gets | Indicative monthly rate |
|---|---|---|
| Featured | "Featured" badge on profile + sponsorRankBoost +1 | $500-1,500 |
| Premium | Featured slot at top of category + +2 boost + first slot in top-10 + lead form CTA on category leads | $2,000-5,000 |
| Comparison sponsor | Sponsored slot on a specific vs page they'd otherwise lose | $300-800 / page / mo |

Rates are placeholders; calibrate against traffic. Phase 1 ships admin tools to *configure* placements; Bar handles outreach, contracts, and billing offline (Stripe invoices or check).

### 7.2 Placement Rendering

- Sponsored vendors carry a visible "Sponsored" badge wherever boosted
- Featured slot at top of category page = its own row labeled "Featured Partners," separated from editorial rankings
- Top-10 list: max 1 sponsored slot in positions 1-5, `ourScore >= 7` minimum
- Vs pages: sponsor gets the top "verdict" CTA, editorial verdict text unchanged

### 7.3 Sponsorship Admin

- Create/edit `SponsoredPlacement` rows (vendor + category + tier + dates + rate + active flag)
- Cron-style check: if `endsAt < now()`, auto-deactivate
- Dashboard shows active placements + MRR + expiring soon

### 7.4 Display Ads

Reserve 4 slot positions in templates from day one (no ads load until flag enabled):
1. In-content (between blocks on long pages)
2. Sidebar (sticky on long-form pages)
3. Below fold on category pages
4. End-of-article on buyer guides

**Rule:** never on vendor profiles or comparison pages - these are commercial intent, ads cannibalize lead conversion. Ads only on educational pages (buyer guides, future blog).

Phase 1 ships with slots wired but disabled. Apply for AdSense once ~3K monthly visitors. Switch to Mediavine at ~50K (much higher RPM).

### 7.5 Why Three Streams Coexist

Lead gen captures highest-value visitors (commercial intent, clear conversion). Sponsorships extract value from vendors wanting preferential treatment. Ads extract residual value from informational traffic that wasn't going to convert anyway. Stacked, they don't cannibalize each other.

---

## 8. Admin Panel

Single-user admin (Bar), basic auth, server-rendered. Mirrors the Coastal CMS pattern. Lives at `/admin/*`.

### 8.1 Sections

- **Dashboard** - quick stats: total vendors, draft pages, leads this week, active sponsorships, MRR, recent activity
- **Categories** - list/edit/reorder. Edit category copy, FAQ, hero image, SEO meta
- **Vendors** - table view (filter by category, status, sponsor tier). Click vendor → full edit form. Buttons: "Re-run research", "Re-generate copy", "Preview", "Publish"
- **Comparisons** - list of all vs pages. Auto-generated when both vendors published, but editable. "Generate" button on demand for any pair
- **Buyer guides** - markdown editor per category, with regenerate button
- **Leads inbox** - table (filter by status, category, vendor). Detail shows full submission + utm + page. Buttons: "Mark sent", "Forward to vendor", "Disqualify", "Add internal note"
- **Sponsorships** - CRUD on `SponsoredPlacement`. Calendar view of active placements + expiring soon. MRR rollup at top
- **Content queue** - all `status: draft` pages, oldest first. Bulk publish, bulk regenerate
- **Settings** - site config (name, domain, contact email, AdSense ID, Turnstile keys), feature flags (ads on/off, lead emails on/off)

### 8.2 Auth

Single admin user, email + password (bcrypt), HttpOnly session cookie. No 2FA in Phase 1 - add when revenue justifies it. Lock down `/admin/*` via middleware.

### 8.3 Realtime Feel

Edits trigger `revalidatePath()` for affected public routes so published changes appear within ~1 second.

---

## 9. SEO Essentials

### 9.1 Sitemap & Indexing

- Auto-generated `/sitemap.xml` chained from a sitemap index, split by type:
  - `sitemap-categories.xml`
  - `sitemap-vendors.xml`
  - `sitemap-comparisons.xml`
  - `sitemap-guides.xml`
- `/robots.txt` allowing all, blocking `/admin/*` and `/api/*`
- Submit to Google Search Console + Bing Webmaster on launch (Bar has GSC OAuth in memory)

### 9.2 Schema.org Structured Data (JSON-LD per page type)

- Category page → `CollectionPage` + `BreadcrumbList` + `FAQPage`
- Top-N list → `ItemList` (each item = `SoftwareApplication`)
- Vendor profile → `SoftwareApplication` with `aggregateRating` (editorial score, properly disclosed) + `Offer` for pricing + `BreadcrumbList`
- Vs page → `ComparisonReview` (custom) + `BreadcrumbList`
- Buyer guide → `Article` + `BreadcrumbList`

### 9.3 Internal Linking

- Every category page links to all its vendors + top-N + buyer guide
- Every vendor profile links to: category, top-N, 3-5 closest competitors, alternatives page, all comparisons featuring this vendor
- Every comparison page links to: both vendors, the category, "alternatives to A", "alternatives to B"
- Buyer guide links to: top-N, all featured vendors mentioned in copy
- Auto-generated "related" rows on every page (3-5 contextually relevant links)
- Footer hub linking to all categories - home → category at most 2 clicks

### 9.4 Page-Level Metadata

- Distinct `<title>` and `<meta description>` per page, generated from templates with vendor/category-specific data (no duplicates, no defaults)
- Canonical URL per page (avoid duplicates from query strings)
- OpenGraph + Twitter cards every page (auto-generated OG images via `@vercel/og` - vendor logo + name + category)
- `hreflang` not needed (English-only Phase 1)

### 9.5 Performance

- Next.js Image for all images (WebP, lazy loading)
- Page weight budget: <300KB on category/profile pages, <500KB on long-form guides
- Core Web Vitals targets: LCP <2.5s, CLS <0.1, INP <200ms
- No client-side analytics on first load - defer GA/Plausible until idle

### 9.6 Trust Signals (E-E-A-T)

- "About us" page with real names, bios, debt-industry credentials → footer link
- "How we evaluate" methodology page → linked from every category page
- "Editorial standards" page → discloses sponsored relationships, FTC-compliant
- Contact page with real email, phone, address
- Author byline on buyer guides + articles

---

## 10. Out of Scope (Phase 2 and Beyond)

Reserved for separate spec when traffic justifies the build:

- User accounts and review submission
- User reviews + ratings + moderation queue
- Vendor self-serve portal (claim profile, edit, billing)
- Paid placement billing automation (Stripe subscriptions)
- Auto-routing of category-scoped leads to top sponsored vendors
- Sub-segment list pages (`/[category]/for-[persona]`)
- Blog / educational long-tail content
- Multi-language support
- 2FA for admin
- Role-based access for additional team members

---

## 11. Open Questions

To resolve during planning or before launch:

- Brand name + domain - TBD; codebase does not depend on it
- Email provider choice (Resend vs Postmark) - pick during implementation
- Final monthly sponsorship rates - calibrate against actual traffic
- Initial 20-30 vendor seed list per category - assemble during content phase
