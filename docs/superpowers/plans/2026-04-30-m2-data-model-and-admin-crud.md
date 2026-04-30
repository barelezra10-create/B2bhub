# M2: Data Model + Admin CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add the remaining DB schemas (Category, Vendor, VendorScreenshot, Comparison, BuyerGuide, Lead, SponsoredPlacement) and build admin CRUD for the four content entities Bar will populate manually before M3 ships public pages: Categories, Vendors, Comparisons, Buyer Guides. Lead inbox and sponsorship CRUD ship in later milestones (M4 and M5).

**Architecture:** Server Components for list pages, Server Actions for mutations, Client Components only where interactivity is needed (search filters, markdown preview). All admin pages live under `/admin/*` and inherit the existing layout/auth shell. After M2, every public page in M3 reads from these tables.

**Tech Stack:** Next.js 16 App Router (Server Actions), Prisma 7 with `@prisma/adapter-pg`, Postgres on Railway, Tailwind v4, Zod 4 for input validation, Vitest 4 for unit tests.

---

## File Structure

```
b2b-hub/
├── prisma/
│   └── schema.prisma                                    # extended with M2 models
├── src/
│   ├── lib/
│   │   ├── revalidate.ts                                # NEW - paths to revalidate per entity
│   │   └── slug.ts                                      # NEW - generate URL slugs
│   ├── app/admin/
│   │   ├── _components/
│   │   │   ├── AdminPageHeader.tsx                      # NEW
│   │   │   ├── AdminTable.tsx                           # NEW (generic list table)
│   │   │   ├── FormField.tsx                            # NEW (label + input + error)
│   │   │   ├── FormSection.tsx                          # NEW (grouped fields with heading)
│   │   │   ├── SubmitButton.tsx                         # NEW (with useFormStatus)
│   │   │   └── DeleteButton.tsx                         # NEW (confirm + server action)
│   │   ├── categories/
│   │   │   ├── page.tsx                                 # NEW list
│   │   │   ├── new/page.tsx                             # NEW create
│   │   │   ├── [slug]/page.tsx                          # NEW edit
│   │   │   ├── _components/CategoryForm.tsx             # NEW
│   │   │   └── actions.ts                               # NEW server actions
│   │   ├── vendors/
│   │   │   ├── page.tsx                                 # NEW list (with filters)
│   │   │   ├── new/page.tsx                             # NEW create
│   │   │   ├── [slug]/page.tsx                          # NEW edit
│   │   │   ├── _components/VendorForm.tsx               # NEW (sectioned form)
│   │   │   └── actions.ts                               # NEW
│   │   ├── comparisons/
│   │   │   ├── page.tsx                                 # NEW list
│   │   │   ├── new/page.tsx                             # NEW (pick vendor A + B)
│   │   │   ├── [slug]/page.tsx                          # NEW edit
│   │   │   ├── _components/ComparisonForm.tsx           # NEW
│   │   │   └── actions.ts                               # NEW
│   │   └── buyer-guides/
│   │       ├── page.tsx                                 # NEW list
│   │       ├── new/page.tsx                             # NEW
│   │       ├── [slug]/page.tsx                          # NEW edit
│   │       ├── _components/BuyerGuideForm.tsx           # NEW (markdown textarea)
│   │       └── actions.ts                               # NEW
└── tests/
    ├── lib/
    │   └── slug.test.ts                                 # NEW
    └── admin/
        ├── categories.actions.test.ts                   # NEW
        ├── vendors.actions.test.ts                      # NEW
        ├── comparisons.actions.test.ts                  # NEW
        └── buyer-guides.actions.test.ts                 # NEW
```

---

## Task 1: Extend Prisma schema with all remaining M2 models

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_m2_models/migration.sql` (auto-generated)

- [ ] **Step 1: Add models to schema**

Replace the entire `prisma/schema.prisma` with:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
}

model AdminUser {
  id           String   @id @default(cuid())
  email        String   @unique
  passwordHash String
  role         String   @default("admin")
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

model Category {
  id              String      @id @default(cuid())
  slug            String      @unique
  name            String
  description     String      @db.Text
  icon            String?
  heroImage       String?
  seoTitle        String?
  seoDescription  String?
  sortOrder       Int         @default(0)
  isActive        Boolean     @default(true)
  createdAt       DateTime    @default(now())
  updatedAt       DateTime    @updatedAt

  vendors         Vendor[]
  buyerGuides     BuyerGuide[]
  leads           Lead[]
  sponsoredPlacements SponsoredPlacement[]

  @@index([sortOrder])
}

enum PricingModel {
  free
  freemium
  paid
  quote
}

enum Segment {
  smb
  mid_market
  enterprise
  all
}

enum SponsorTier {
  none
  featured
  premium
}

enum VendorStatus {
  draft
  published
}

model Vendor {
  id                  String        @id @default(cuid())
  slug                String        @unique
  name                String
  logoUrl             String?
  websiteUrl          String

  categoryId          String
  category            Category      @relation(fields: [categoryId], references: [id], onDelete: Restrict)

  tagline             String?
  descriptionShort    String?       @db.Text
  descriptionLong     String?       @db.Text

  foundedYear         Int?
  hqLocation          String?
  employeeCountRange  String?

  pricingModel        PricingModel  @default(quote)
  pricingStartingAt   String?
  pricingNotes        String?       @db.Text

  bestForSegment      Segment       @default(all)
  ourScore            Int?
  ourScoreNotes       String?       @db.Text

  pros                String[]
  cons                String[]
  keyFeatures         String[]
  integrations        String[]

  isClaimed           Boolean       @default(false)
  isPaidSponsor       Boolean       @default(false)
  sponsorTier         SponsorTier   @default(none)
  sponsorRankBoost    Int           @default(0)

  leadFormEnabled     Boolean       @default(true)
  leadDestination     String?
  affiliateUrl        String?

  status              VendorStatus  @default(draft)
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt

  screenshots         VendorScreenshot[]
  comparisonsAsA      Comparison[]  @relation("ComparisonVendorA")
  comparisonsAsB      Comparison[]  @relation("ComparisonVendorB")
  leads               Lead[]
  sponsoredPlacements SponsoredPlacement[]

  @@index([categoryId])
  @@index([status])
  @@index([sponsorTier])
}

model VendorScreenshot {
  id        String   @id @default(cuid())
  vendorId  String
  vendor    Vendor   @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  url       String
  caption   String?
  sortOrder Int      @default(0)
  createdAt DateTime @default(now())

  @@index([vendorId])
}

model Comparison {
  id           String   @id @default(cuid())
  slug         String   @unique
  vendorAId    String
  vendorA      Vendor   @relation("ComparisonVendorA", fields: [vendorAId], references: [id], onDelete: Cascade)
  vendorBId    String
  vendorB      Vendor   @relation("ComparisonVendorB", fields: [vendorBId], references: [id], onDelete: Cascade)

  hookCopy     String?  @db.Text
  summaryCopy  String?  @db.Text
  verdictCopy  String?  @db.Text

  isPublished  Boolean  @default(false)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@unique([vendorAId, vendorBId])
}

model BuyerGuide {
  id              String   @id @default(cuid())
  slug            String   @unique
  categoryId      String
  category        Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  title           String
  bodyMarkdown    String   @db.Text
  tableOfContents Json?
  isPublished     Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  @@index([categoryId])
}

enum LeadIntent {
  evaluating
  ready_to_buy
  just_looking
}

enum LeadStatus {
  new
  sent_to_vendor
  qualified
  disqualified
}

model Lead {
  id                  String      @id @default(cuid())
  vendorId            String?
  vendor              Vendor?     @relation(fields: [vendorId], references: [id], onDelete: SetNull)
  categoryId          String?
  category            Category?   @relation(fields: [categoryId], references: [id], onDelete: SetNull)

  pagePath            String
  contactName         String
  contactEmail        String
  contactPhone        String?
  companyName         String?
  companySize         String?

  intent              LeadIntent  @default(evaluating)
  message             String?     @db.Text

  status              LeadStatus  @default(new)
  vendorEmailSentAt   DateTime?
  internalNotes       String?     @db.Text

  utmSource           String?
  utmMedium           String?
  utmCampaign         String?
  gclid               String?
  referrer            String?
  ipHash              String?

  createdAt           DateTime    @default(now())

  @@index([vendorId])
  @@index([categoryId])
  @@index([status])
  @@index([createdAt])
}

enum PlacementType {
  top_of_category
  featured_compare
  sidebar
}

model SponsoredPlacement {
  id            String         @id @default(cuid())
  vendorId      String
  vendor        Vendor         @relation(fields: [vendorId], references: [id], onDelete: Cascade)
  categoryId    String?
  category      Category?      @relation(fields: [categoryId], references: [id], onDelete: SetNull)
  placementType PlacementType
  startsAt      DateTime
  endsAt        DateTime
  monthlyRate   Decimal        @db.Decimal(10, 2)
  isActive      Boolean        @default(true)
  notes         String?        @db.Text
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@index([vendorId])
  @@index([isActive])
}
```

- [ ] **Step 2: Generate and apply migration**

```bash
cd ~/b2b-hub
pnpm prisma migrate dev --name m2_models
```

Expected: a new migration file is created and applied. The Prisma client is regenerated.

If migration fails due to a connection issue, double-check `.env.local` has the Railway public proxy URL.

- [ ] **Step 3: Verify the new tables on Railway**

```bash
node -e "
import('@prisma/client').then(async ({ PrismaClient }) => {
  const { PrismaPg } = await import('@prisma/adapter-pg');
  const { config } = await import('dotenv');
  config({ path: '.env.local' });
  const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  console.log('Tables:', await db.\$queryRaw\`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename\`);
  await db.\$disconnect();
});
"
```

Expected: lists `AdminUser`, `BuyerGuide`, `Category`, `Comparison`, `Lead`, `SponsoredPlacement`, `Vendor`, `VendorScreenshot`, plus Prisma's `_prisma_migrations`.

- [ ] **Step 4: Commit**

```bash
git add prisma/
git commit -m "feat(m2): add Category, Vendor, Comparison, BuyerGuide, Lead, SponsoredPlacement schemas"
```

---

## Task 2: Slug helper with TDD

**Files:**
- Create: `src/lib/slug.ts`, `tests/lib/slug.test.ts`

- [ ] **Step 1: Write failing tests**

`tests/lib/slug.test.ts`:

```typescript
import { describe, it, expect } from "vitest";
import { toSlug, vsSlug } from "@/lib/slug";

describe("toSlug", () => {
  it("lowercases and replaces spaces with dashes", () => {
    expect(toSlug("Debt Collection Software")).toBe("debt-collection-software");
  });

  it("strips non-alphanumeric except dashes", () => {
    expect(toSlug("Quantrax & Co.")).toBe("quantrax-co");
  });

  it("collapses multiple dashes", () => {
    expect(toSlug("foo  --  bar")).toBe("foo-bar");
  });

  it("trims leading/trailing dashes", () => {
    expect(toSlug("---hello---")).toBe("hello");
  });

  it("handles unicode by stripping it", () => {
    expect(toSlug("Café déjà vu")).toBe("caf-d-j-vu");
  });
});

describe("vsSlug", () => {
  it("joins two vendor slugs with -vs-", () => {
    expect(vsSlug("salesforce", "hubspot")).toBe("salesforce-vs-hubspot");
  });

  it("orders alphabetically so order-independent", () => {
    expect(vsSlug("hubspot", "salesforce")).toBe("hubspot-vs-salesforce");
    expect(vsSlug("salesforce", "hubspot")).toBe("hubspot-vs-salesforce");
  });
});
```

- [ ] **Step 2: Run, expect failure**

```bash
pnpm test slug
```

Expected: 7 failures, all "Cannot find package '@/lib/slug'".

- [ ] **Step 3: Implement**

`src/lib/slug.ts`:

```typescript
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function vsSlug(a: string, b: string): string {
  const [first, second] = [a, b].sort();
  return `${first}-vs-${second}`;
}
```

- [ ] **Step 4: Run, expect 7 pass**

```bash
pnpm test slug
```

Expected: 7/7 pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/slug.ts tests/lib/slug.test.ts
git commit -m "feat(m2): add slug + vs-slug helpers with tests"
```

---

## Task 3: Revalidation helper

**Files:**
- Create: `src/lib/revalidate.ts`

- [ ] **Step 1: Implement helper**

`src/lib/revalidate.ts`:

```typescript
import { revalidatePath } from "next/cache";

// Reused by server actions when content changes.
// Expand in M3 once public pages exist; for now just admin pages get revalidated.

export function revalidateCategory(slug: string) {
  revalidatePath("/admin/categories");
  revalidatePath(`/admin/categories/${slug}`);
  // M3: also revalidate `/${slug}`, `/${slug}/best`, etc.
}

export function revalidateVendor(categorySlug: string, vendorSlug: string) {
  revalidatePath("/admin/vendors");
  revalidatePath(`/admin/vendors/${vendorSlug}`);
  // M3: also revalidate `/${categorySlug}`, `/${categorySlug}/${vendorSlug}`, etc.
}

export function revalidateComparison(slug: string) {
  revalidatePath("/admin/comparisons");
  revalidatePath(`/admin/comparisons/${slug}`);
  // M3: also revalidate `/compare/${slug}`.
}

export function revalidateBuyerGuide(categorySlug: string, slug: string) {
  revalidatePath("/admin/buyer-guides");
  revalidatePath(`/admin/buyer-guides/${slug}`);
  // M3: also revalidate `/${categorySlug}/buyers-guide`.
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/revalidate.ts
git commit -m "feat(m2): add revalidation helpers (admin scope; M3 extends to public)"
```

---

## Task 4: Shared admin UI primitives

**Files:**
- Create: `src/app/admin/_components/AdminPageHeader.tsx`, `AdminTable.tsx`, `FormField.tsx`, `FormSection.tsx`, `SubmitButton.tsx`, `DeleteButton.tsx`

- [ ] **Step 1: Create `AdminPageHeader.tsx`**

```tsx
import Link from "next/link";

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-slate-600">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </div>
  );
}

export function AdminPrimaryLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700"
    >
      {children}
    </Link>
  );
}
```

- [ ] **Step 2: Create `AdminTable.tsx`**

```tsx
export function AdminTable({
  headers,
  children,
  empty,
}: {
  headers: string[];
  children: React.ReactNode;
  empty?: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {headers.map((h) => (
              <th
                key={h}
                className="px-4 py-2 text-left font-medium text-slate-700"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
      </table>
      {empty ? <div className="p-8 text-center text-sm text-slate-500">{empty}</div> : null}
    </div>
  );
}
```

- [ ] **Step 3: Create `FormField.tsx`**

```tsx
export function FormField({
  label,
  name,
  defaultValue,
  type = "text",
  required,
  placeholder,
  helpText,
  error,
  textarea,
  rows,
}: {
  label: string;
  name: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  error?: string;
  textarea?: boolean;
  rows?: number;
}) {
  const value = defaultValue ?? "";
  const baseClass =
    "mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none";

  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-0.5 text-red-600">*</span> : null}
      </span>
      {textarea ? (
        <textarea
          name={name}
          defaultValue={value as string}
          required={required}
          placeholder={placeholder}
          rows={rows ?? 4}
          className={baseClass}
        />
      ) : (
        <input
          type={type}
          name={name}
          defaultValue={value}
          required={required}
          placeholder={placeholder}
          className={baseClass}
        />
      )}
      {helpText ? <span className="mt-1 block text-xs text-slate-500">{helpText}</span> : null}
      {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
    </label>
  );
}
```

- [ ] **Step 4: Create `FormSection.tsx`**

```tsx
export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-6">
      <header className="mb-4">
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>
        {description ? (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        ) : null}
      </header>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}
```

- [ ] **Step 5: Create `SubmitButton.tsx`**

```tsx
"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  label,
  pendingLabel,
}: {
  label: string;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50"
    >
      {pending ? pendingLabel ?? "Saving..." : label}
    </button>
  );
}
```

- [ ] **Step 6: Create `DeleteButton.tsx`**

```tsx
"use client";

export function DeleteButton({
  action,
  confirmMessage,
}: {
  action: () => Promise<void> | void;
  confirmMessage: string;
}) {
  return (
    <form
      action={async () => {
        if (!confirm(confirmMessage)) return;
        await action();
      }}
    >
      <button
        type="submit"
        className="text-xs text-red-600 hover:text-red-700"
      >
        Delete
      </button>
    </form>
  );
}
```

- [ ] **Step 7: Verify TypeScript**

```bash
pnpm tsc --noEmit
```

Expected: clean.

- [ ] **Step 8: Commit**

```bash
git add src/app/admin/_components/
git commit -m "feat(m2): add shared admin UI primitives (header, table, form fields, buttons)"
```

---

## Task 5: Categories CRUD - server actions with TDD

**Files:**
- Create: `src/app/admin/categories/actions.ts`, `tests/admin/categories.actions.test.ts`

- [ ] **Step 1: Write failing tests**

`tests/admin/categories.actions.test.ts`:

```typescript
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
import { redirect } from "next/navigation";

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
```

- [ ] **Step 2: Run, expect failure**

```bash
pnpm test categories
```

Expected: failures from missing module.

- [ ] **Step 3: Implement actions**

`src/app/admin/categories/actions.ts`:

```typescript
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
```

- [ ] **Step 4: Run, expect 4/4 pass**

```bash
pnpm test categories
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/categories/actions.ts tests/admin/categories.actions.test.ts
git commit -m "feat(m2): categories server actions (create/update/delete) with tests"
```

---

## Task 6: Categories UI - list + new + edit pages

**Files:**
- Create: `src/app/admin/categories/page.tsx`, `src/app/admin/categories/new/page.tsx`, `src/app/admin/categories/[slug]/page.tsx`, `src/app/admin/categories/_components/CategoryForm.tsx`

- [ ] **Step 1: Create form component**

`src/app/admin/categories/_components/CategoryForm.tsx`:

```tsx
import { FormField } from "@/app/admin/_components/FormField";
import { FormSection } from "@/app/admin/_components/FormSection";
import { SubmitButton } from "@/app/admin/_components/SubmitButton";

type CategoryFormValues = {
  id?: string;
  slug?: string;
  name?: string;
  description?: string;
  icon?: string | null;
  heroImage?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  sortOrder?: number;
  isActive?: boolean;
};

export function CategoryForm({
  action,
  initial,
  submitLabel,
}: {
  action: (fd: FormData) => Promise<void>;
  initial?: CategoryFormValues;
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-6 max-w-3xl">
      {initial?.id ? <input type="hidden" name="id" defaultValue={initial.id} /> : null}

      <FormSection title="Basics">
        <FormField label="Name" name="name" defaultValue={initial?.name} required />
        {initial?.slug ? (
          <FormField label="Slug" name="slug" defaultValue={initial.slug} required />
        ) : null}
        <FormField
          label="Description"
          name="description"
          defaultValue={initial?.description}
          required
          textarea
          rows={4}
        />
        <FormField label="Icon (emoji or short text)" name="icon" defaultValue={initial?.icon ?? ""} />
        <FormField label="Hero image URL" name="heroImage" defaultValue={initial?.heroImage ?? ""} />
      </FormSection>

      <FormSection title="SEO">
        <FormField label="SEO title" name="seoTitle" defaultValue={initial?.seoTitle ?? ""} />
        <FormField
          label="SEO description"
          name="seoDescription"
          defaultValue={initial?.seoDescription ?? ""}
          textarea
          rows={2}
        />
      </FormSection>

      <FormSection title="Ordering">
        <FormField
          label="Sort order"
          name="sortOrder"
          type="number"
          defaultValue={initial?.sortOrder ?? 0}
          helpText="Lower numbers show first."
        />
        {initial?.id ? (
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={initial?.isActive ?? true}
            />
            Active (visible on the public site)
          </label>
        ) : null}
      </FormSection>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
```

- [ ] **Step 2: Create list page**

`src/app/admin/categories/page.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { AdminPageHeader, AdminPrimaryLink } from "@/app/admin/_components/AdminPageHeader";
import { AdminTable } from "@/app/admin/_components/AdminTable";

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { vendors: true } } },
  });

  return (
    <div>
      <AdminPageHeader
        title="Categories"
        description="Top-level categories. Each has its own URL and hosts a vendor list, top-N, and buyer guide."
        actions={<AdminPrimaryLink href="/admin/categories/new">New category</AdminPrimaryLink>}
      />

      {categories.length === 0 ? (
        <AdminTable headers={["Name", "Slug", "Vendors", "Active"]} empty="No categories yet. Create the first one.">
          {null}
        </AdminTable>
      ) : (
        <AdminTable headers={["Name", "Slug", "Vendors", "Active"]}>
          {categories.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-2">
                <Link href={`/admin/categories/${c.slug}`} className="font-medium text-slate-900 hover:underline">
                  {c.name}
                </Link>
              </td>
              <td className="px-4 py-2 text-slate-600">/{c.slug}</td>
              <td className="px-4 py-2 text-slate-600">{c._count.vendors}</td>
              <td className="px-4 py-2 text-slate-600">{c.isActive ? "Yes" : "No"}</td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Create new page**

`src/app/admin/categories/new/page.tsx`:

```tsx
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { CategoryForm } from "../_components/CategoryForm";
import { createCategoryAction } from "../actions";

export default function NewCategoryPage() {
  return (
    <div>
      <AdminPageHeader title="New category" />
      <CategoryForm action={createCategoryAction} submitLabel="Create category" />
    </div>
  );
}
```

- [ ] **Step 4: Create edit page**

`src/app/admin/categories/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { DeleteButton } from "@/app/admin/_components/DeleteButton";
import { CategoryForm } from "../_components/CategoryForm";
import { updateCategoryAction, deleteCategoryAction } from "../actions";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = await db.category.findUnique({ where: { slug } });
  if (!category) notFound();

  return (
    <div>
      <AdminPageHeader
        title={category.name}
        description={`/${category.slug}`}
        actions={
          <DeleteButton
            confirmMessage={`Delete category "${category.name}"? This cannot be undone.`}
            action={async () => {
              "use server";
              await deleteCategoryAction(category.id);
            }}
          />
        }
      />
      <CategoryForm
        action={updateCategoryAction}
        initial={{ ...category, sortOrder: category.sortOrder }}
        submitLabel="Save changes"
      />
    </div>
  );
}
```

- [ ] **Step 5: Manual smoke test**

```bash
pnpm dev > /tmp/dev3.log 2>&1 &
DEV=$!
sleep 6
PORT=$(grep -oE "localhost:[0-9]+" /tmp/dev3.log | head -1 | cut -d: -f2)

# Login (using the dev creds)
curl -sS -c /tmp/c.txt -X POST "http://localhost:$PORT/api/auth/login" \
  -H 'content-type: application/json' \
  -d '{"email":"bar@albert-capital.com","password":"dev-admin-password-change-me"}' \
  -w "\nLOGIN %{http_code}\n"

# List categories (should be 200, empty list)
curl -sS -b /tmp/c.txt "http://localhost:$PORT/admin/categories" -o /dev/null -w "LIST %{http_code}\n"

# Visit new
curl -sS -b /tmp/c.txt "http://localhost:$PORT/admin/categories/new" -o /dev/null -w "NEW %{http_code}\n"

kill $DEV
```

Expected: LOGIN 200, LIST 200, NEW 200.

- [ ] **Step 6: TypeScript check + tests**

```bash
pnpm tsc --noEmit
pnpm test
```

Expected: clean, all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/app/admin/categories/
git commit -m "feat(m2): categories list, new, and edit pages"
```

---

## Task 7: Vendors CRUD - server actions with TDD

**Files:**
- Create: `src/app/admin/vendors/actions.ts`, `tests/admin/vendors.actions.test.ts`

- [ ] **Step 1: Write failing tests**

`tests/admin/vendors.actions.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createVendorAction, updateVendorAction, deleteVendorAction } from "@/app/admin/vendors/actions";

vi.mock("@/lib/db", () => ({
  db: {
    vendor: {
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

import { db } from "@/lib/db";

describe("createVendorAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates a vendor with required fields and arrays parsed from comma-separated", async () => {
    vi.mocked(db.vendor.create).mockResolvedValueOnce({
      id: "v1",
      slug: "quantrax",
      name: "Quantrax",
      categoryId: "c1",
    } as never);

    const fd = new FormData();
    fd.set("name", "Quantrax");
    fd.set("websiteUrl", "https://quantrax.com");
    fd.set("categoryId", "c1");
    fd.set("pros", "Robust reporting\nGreat support");
    fd.set("cons", "Dated UI");
    fd.set("keyFeatures", "Reporting, Workflow");
    fd.set("integrations", "");
    fd.set("pricingModel", "quote");
    fd.set("bestForSegment", "all");
    fd.set("ourScore", "8");
    fd.set("sponsorTier", "none");
    fd.set("sponsorRankBoost", "0");
    fd.set("status", "draft");

    await expect(createVendorAction(fd)).rejects.toThrow(/REDIRECT:\/admin\/vendors\/quantrax/);

    expect(db.vendor.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        name: "Quantrax",
        slug: "quantrax",
        websiteUrl: "https://quantrax.com",
        categoryId: "c1",
        pros: ["Robust reporting", "Great support"],
        cons: ["Dated UI"],
        keyFeatures: ["Reporting", "Workflow"],
        integrations: [],
        ourScore: 8,
      }),
    });
  });

  it("rejects when websiteUrl is invalid", async () => {
    const fd = new FormData();
    fd.set("name", "X");
    fd.set("websiteUrl", "not-a-url");
    fd.set("categoryId", "c1");
    fd.set("pricingModel", "quote");
    fd.set("bestForSegment", "all");
    fd.set("sponsorTier", "none");
    fd.set("sponsorRankBoost", "0");
    fd.set("status", "draft");
    await expect(createVendorAction(fd)).rejects.toThrow();
    expect(db.vendor.create).not.toHaveBeenCalled();
  });
});

describe("updateVendorAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates by id and redirects to the new slug", async () => {
    vi.mocked(db.vendor.update).mockResolvedValueOnce({
      id: "v1",
      slug: "renamed",
      categoryId: "c1",
      category: { slug: "debt" },
    } as never);

    const fd = new FormData();
    fd.set("id", "v1");
    fd.set("slug", "renamed");
    fd.set("name", "Renamed");
    fd.set("websiteUrl", "https://example.com");
    fd.set("categoryId", "c1");
    fd.set("pros", "");
    fd.set("cons", "");
    fd.set("keyFeatures", "");
    fd.set("integrations", "");
    fd.set("pricingModel", "paid");
    fd.set("bestForSegment", "smb");
    fd.set("sponsorTier", "none");
    fd.set("sponsorRankBoost", "0");
    fd.set("status", "published");

    await expect(updateVendorAction(fd)).rejects.toThrow(/REDIRECT:\/admin\/vendors\/renamed/);
    expect(db.vendor.update).toHaveBeenCalled();
  });
});

describe("deleteVendorAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("deletes and redirects", async () => {
    vi.mocked(db.vendor.delete).mockResolvedValueOnce({ id: "v1" } as never);
    await expect(deleteVendorAction("v1")).rejects.toThrow("REDIRECT:/admin/vendors");
  });
});
```

- [ ] **Step 2: Run, expect failure**

```bash
pnpm test vendors
```

- [ ] **Step 3: Implement**

`src/app/admin/vendors/actions.ts`:

```typescript
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
  // Accept comma- or newline-separated
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
```

- [ ] **Step 4: Run, expect 4/4 pass**

```bash
pnpm test vendors
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/vendors/actions.ts tests/admin/vendors.actions.test.ts
git commit -m "feat(m2): vendor server actions (create/update/delete) with tests"
```

---

## Task 8: Vendors UI - list, new, edit (sectioned form)

**Files:**
- Create: `src/app/admin/vendors/page.tsx`, `src/app/admin/vendors/new/page.tsx`, `src/app/admin/vendors/[slug]/page.tsx`, `src/app/admin/vendors/_components/VendorForm.tsx`

- [ ] **Step 1: Create the form component**

`src/app/admin/vendors/_components/VendorForm.tsx`:

```tsx
import { FormField } from "@/app/admin/_components/FormField";
import { FormSection } from "@/app/admin/_components/FormSection";
import { SubmitButton } from "@/app/admin/_components/SubmitButton";

type VendorFormValues = {
  id?: string;
  slug?: string;
  name?: string;
  websiteUrl?: string;
  logoUrl?: string | null;
  tagline?: string | null;
  descriptionShort?: string | null;
  descriptionLong?: string | null;
  categoryId?: string;
  foundedYear?: number | null;
  hqLocation?: string | null;
  employeeCountRange?: string | null;
  pricingModel?: string;
  pricingStartingAt?: string | null;
  pricingNotes?: string | null;
  bestForSegment?: string;
  ourScore?: number | null;
  ourScoreNotes?: string | null;
  pros?: string[];
  cons?: string[];
  keyFeatures?: string[];
  integrations?: string[];
  isPaidSponsor?: boolean;
  sponsorTier?: string;
  sponsorRankBoost?: number;
  leadFormEnabled?: boolean;
  leadDestination?: string | null;
  affiliateUrl?: string | null;
  status?: string;
};

const PRICING_OPTIONS = [
  { value: "free", label: "Free" },
  { value: "freemium", label: "Freemium" },
  { value: "paid", label: "Paid" },
  { value: "quote", label: "Quote / Custom" },
];

const SEGMENT_OPTIONS = [
  { value: "smb", label: "SMB" },
  { value: "mid_market", label: "Mid-market" },
  { value: "enterprise", label: "Enterprise" },
  { value: "all", label: "All sizes" },
];

const SPONSOR_OPTIONS = [
  { value: "none", label: "None" },
  { value: "featured", label: "Featured" },
  { value: "premium", label: "Premium" },
];

const STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
];

function Select({
  label,
  name,
  options,
  defaultValue,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-slate-700">{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-900 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

export function VendorForm({
  action,
  initial,
  categories,
  submitLabel,
}: {
  action: (fd: FormData) => Promise<void>;
  initial?: VendorFormValues;
  categories: { id: string; name: string }[];
  submitLabel: string;
}) {
  const listToTextarea = (xs?: string[]) => (xs ?? []).join("\n");

  return (
    <form action={action} className="space-y-6 max-w-3xl">
      {initial?.id ? <input type="hidden" name="id" defaultValue={initial.id} /> : null}

      <FormSection title="Basics">
        <FormField label="Name" name="name" defaultValue={initial?.name} required />
        {initial?.slug ? (
          <FormField label="Slug" name="slug" defaultValue={initial.slug} required />
        ) : null}
        <FormField label="Website URL" name="websiteUrl" defaultValue={initial?.websiteUrl} required />
        <FormField label="Logo URL" name="logoUrl" defaultValue={initial?.logoUrl ?? ""} />
        <FormField label="Tagline" name="tagline" defaultValue={initial?.tagline ?? ""} />
        <Select
          label="Category"
          name="categoryId"
          defaultValue={initial?.categoryId}
          options={categories.map((c) => ({ value: c.id, label: c.name }))}
        />
        <FormField
          label="Short description (1-2 sentences)"
          name="descriptionShort"
          defaultValue={initial?.descriptionShort ?? ""}
          textarea
          rows={2}
        />
        <FormField
          label="Long description (markdown)"
          name="descriptionLong"
          defaultValue={initial?.descriptionLong ?? ""}
          textarea
          rows={8}
        />
      </FormSection>

      <FormSection title="Company">
        <FormField label="Founded year" name="foundedYear" type="number" defaultValue={initial?.foundedYear ?? ""} />
        <FormField label="HQ location" name="hqLocation" defaultValue={initial?.hqLocation ?? ""} />
        <FormField label="Employee count range" name="employeeCountRange" defaultValue={initial?.employeeCountRange ?? ""} placeholder="50-200" />
      </FormSection>

      <FormSection title="Pricing">
        <Select label="Pricing model" name="pricingModel" defaultValue={initial?.pricingModel ?? "quote"} options={PRICING_OPTIONS} />
        <FormField label="Starting at" name="pricingStartingAt" defaultValue={initial?.pricingStartingAt ?? ""} placeholder="$99/mo" />
        <FormField
          label="Pricing notes"
          name="pricingNotes"
          defaultValue={initial?.pricingNotes ?? ""}
          textarea
          rows={3}
        />
      </FormSection>

      <FormSection title="Editorial">
        <Select label="Best for" name="bestForSegment" defaultValue={initial?.bestForSegment ?? "all"} options={SEGMENT_OPTIONS} />
        <FormField label="Our score (1-10)" name="ourScore" type="number" defaultValue={initial?.ourScore ?? ""} />
        <FormField
          label="Score notes"
          name="ourScoreNotes"
          defaultValue={initial?.ourScoreNotes ?? ""}
          textarea
          rows={3}
        />
        <FormField
          label="Pros (one per line)"
          name="pros"
          defaultValue={listToTextarea(initial?.pros)}
          textarea
          rows={4}
        />
        <FormField
          label="Cons (one per line)"
          name="cons"
          defaultValue={listToTextarea(initial?.cons)}
          textarea
          rows={4}
        />
        <FormField
          label="Key features (one per line)"
          name="keyFeatures"
          defaultValue={listToTextarea(initial?.keyFeatures)}
          textarea
          rows={5}
        />
        <FormField
          label="Integrations (one per line)"
          name="integrations"
          defaultValue={listToTextarea(initial?.integrations)}
          textarea
          rows={4}
        />
      </FormSection>

      <FormSection title="Sponsorship & Lead routing">
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="isPaidSponsor" defaultChecked={initial?.isPaidSponsor ?? false} />
          Paid sponsor
        </label>
        <Select label="Sponsor tier" name="sponsorTier" defaultValue={initial?.sponsorTier ?? "none"} options={SPONSOR_OPTIONS} />
        <FormField
          label="Sponsor rank boost (0-2)"
          name="sponsorRankBoost"
          type="number"
          defaultValue={initial?.sponsorRankBoost ?? 0}
        />
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="leadFormEnabled" defaultChecked={initial?.leadFormEnabled ?? true} />
          Lead form enabled on this vendor profile
        </label>
        <FormField label="Lead destination (email or webhook)" name="leadDestination" defaultValue={initial?.leadDestination ?? ""} />
        <FormField label="Affiliate URL (alternative to lead form)" name="affiliateUrl" defaultValue={initial?.affiliateUrl ?? ""} />
      </FormSection>

      <FormSection title="Publish">
        <Select label="Status" name="status" defaultValue={initial?.status ?? "draft"} options={STATUS_OPTIONS} />
      </FormSection>

      <SubmitButton label={submitLabel} />
    </form>
  );
}
```

- [ ] **Step 2: List page**

`src/app/admin/vendors/page.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { AdminPageHeader, AdminPrimaryLink } from "@/app/admin/_components/AdminPageHeader";
import { AdminTable } from "@/app/admin/_components/AdminTable";

export default async function VendorsPage() {
  const vendors = await db.vendor.findMany({
    orderBy: [{ name: "asc" }],
    include: { category: true },
  });

  return (
    <div>
      <AdminPageHeader
        title="Vendors"
        actions={<AdminPrimaryLink href="/admin/vendors/new">New vendor</AdminPrimaryLink>}
      />
      {vendors.length === 0 ? (
        <AdminTable headers={["Name", "Category", "Status", "Score", "Sponsor"]} empty="No vendors yet.">
          {null}
        </AdminTable>
      ) : (
        <AdminTable headers={["Name", "Category", "Status", "Score", "Sponsor"]}>
          {vendors.map((v) => (
            <tr key={v.id}>
              <td className="px-4 py-2">
                <Link href={`/admin/vendors/${v.slug}`} className="font-medium text-slate-900 hover:underline">
                  {v.name}
                </Link>
              </td>
              <td className="px-4 py-2 text-slate-600">{v.category.name}</td>
              <td className="px-4 py-2 text-slate-600">{v.status}</td>
              <td className="px-4 py-2 text-slate-600">{v.ourScore ?? "-"}</td>
              <td className="px-4 py-2 text-slate-600">{v.sponsorTier}</td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
```

- [ ] **Step 3: New page**

`src/app/admin/vendors/new/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { VendorForm } from "../_components/VendorForm";
import { createVendorAction } from "../actions";

export default async function NewVendorPage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return (
    <div>
      <AdminPageHeader title="New vendor" />
      <VendorForm action={createVendorAction} categories={categories} submitLabel="Create vendor" />
    </div>
  );
}
```

- [ ] **Step 4: Edit page**

`src/app/admin/vendors/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { DeleteButton } from "@/app/admin/_components/DeleteButton";
import { VendorForm } from "../_components/VendorForm";
import { updateVendorAction, deleteVendorAction } from "../actions";

export default async function EditVendorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [vendor, categories] = await Promise.all([
    db.vendor.findUnique({ where: { slug }, include: { category: true } }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!vendor) notFound();

  return (
    <div>
      <AdminPageHeader
        title={vendor.name}
        description={`/${vendor.category.slug}/${vendor.slug}`}
        actions={
          <DeleteButton
            confirmMessage={`Delete vendor "${vendor.name}"? This cannot be undone.`}
            action={async () => {
              "use server";
              await deleteVendorAction(vendor.id);
            }}
          />
        }
      />
      <VendorForm
        action={updateVendorAction}
        categories={categories}
        initial={{ ...vendor }}
        submitLabel="Save changes"
      />
    </div>
  );
}
```

- [ ] **Step 5: Smoke test, TS, tests**

```bash
pnpm tsc --noEmit
pnpm test
```

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/vendors/
git commit -m "feat(m2): vendors list, new, and edit pages"
```

---

## Task 9: Comparisons CRUD - server actions with TDD

**Files:**
- Create: `src/app/admin/comparisons/actions.ts`, `tests/admin/comparisons.actions.test.ts`

- [ ] **Step 1: Write failing tests**

`tests/admin/comparisons.actions.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createComparisonAction, updateComparisonAction, deleteComparisonAction } from "@/app/admin/comparisons/actions";

vi.mock("@/lib/db", () => ({
  db: {
    comparison: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
    vendor: { findMany: vi.fn() },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((u: string) => { throw new Error(`REDIRECT:${u}`); }),
}));

import { db } from "@/lib/db";

describe("createComparisonAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates with sorted vs slug", async () => {
    vi.mocked(db.vendor.findMany).mockResolvedValueOnce([
      { id: "vA", slug: "salesforce" },
      { id: "vB", slug: "hubspot" },
    ] as never);
    vi.mocked(db.comparison.create).mockResolvedValueOnce({ slug: "hubspot-vs-salesforce" } as never);

    const fd = new FormData();
    fd.set("vendorAId", "vA");
    fd.set("vendorBId", "vB");

    await expect(createComparisonAction(fd)).rejects.toThrow(
      "REDIRECT:/admin/comparisons/hubspot-vs-salesforce",
    );

    expect(db.comparison.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        slug: "hubspot-vs-salesforce",
        vendorAId: "vA",
        vendorBId: "vB",
        isPublished: false,
      }),
    });
  });

  it("rejects when both vendor ids match", async () => {
    const fd = new FormData();
    fd.set("vendorAId", "vA");
    fd.set("vendorBId", "vA");
    await expect(createComparisonAction(fd)).rejects.toThrow();
  });
});

describe("updateComparisonAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates copy fields", async () => {
    vi.mocked(db.comparison.update).mockResolvedValueOnce({ slug: "a-vs-b" } as never);
    const fd = new FormData();
    fd.set("id", "cmp1");
    fd.set("slug", "a-vs-b");
    fd.set("hookCopy", "hook");
    fd.set("summaryCopy", "summary");
    fd.set("verdictCopy", "verdict");
    fd.set("isPublished", "on");
    await expect(updateComparisonAction(fd)).rejects.toThrow("REDIRECT:/admin/comparisons/a-vs-b");
    expect(db.comparison.update).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run, expect failure**

```bash
pnpm test comparisons
```

- [ ] **Step 3: Implement**

`src/app/admin/comparisons/actions.ts`:

```typescript
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
```

- [ ] **Step 4: Run, expect 3/3 pass**

```bash
pnpm test comparisons
```

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/comparisons/actions.ts tests/admin/comparisons.actions.test.ts
git commit -m "feat(m2): comparison server actions (create/update/delete) with tests"
```

---

## Task 10: Comparisons UI - list, new (vendor pair picker), edit

**Files:**
- Create: `src/app/admin/comparisons/page.tsx`, `src/app/admin/comparisons/new/page.tsx`, `src/app/admin/comparisons/[slug]/page.tsx`, `src/app/admin/comparisons/_components/ComparisonForm.tsx`

- [ ] **Step 1: Form component**

`src/app/admin/comparisons/_components/ComparisonForm.tsx`:

```tsx
import { FormField } from "@/app/admin/_components/FormField";
import { FormSection } from "@/app/admin/_components/FormSection";
import { SubmitButton } from "@/app/admin/_components/SubmitButton";

export function ComparisonEditForm({
  action,
  initial,
}: {
  action: (fd: FormData) => Promise<void>;
  initial: {
    id: string;
    slug: string;
    hookCopy: string | null;
    summaryCopy: string | null;
    verdictCopy: string | null;
    isPublished: boolean;
  };
}) {
  return (
    <form action={action} className="space-y-6 max-w-3xl">
      <input type="hidden" name="id" defaultValue={initial.id} />
      <input type="hidden" name="slug" defaultValue={initial.slug} />
      <FormSection title="Copy">
        <FormField label="Hook copy" name="hookCopy" defaultValue={initial.hookCopy ?? ""} textarea rows={3} />
        <FormField label="Summary copy" name="summaryCopy" defaultValue={initial.summaryCopy ?? ""} textarea rows={6} />
        <FormField label="Verdict copy" name="verdictCopy" defaultValue={initial.verdictCopy ?? ""} textarea rows={4} />
      </FormSection>
      <FormSection title="Publish">
        <label className="inline-flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" name="isPublished" defaultChecked={initial.isPublished} />
          Published (visible on public site once M3 ships)
        </label>
      </FormSection>
      <SubmitButton label="Save changes" />
    </form>
  );
}

export function NewComparisonForm({
  action,
  vendors,
}: {
  action: (fd: FormData) => Promise<void>;
  vendors: { id: string; name: string; category: { name: string } }[];
}) {
  return (
    <form action={action} className="space-y-4 max-w-2xl">
      <FormSection title="Pick two vendors">
        <label className="block">
          <span className="block text-sm font-medium text-slate-700">Vendor A</span>
          <select
            name="vendorAId"
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select...</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.category.name})
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-slate-700">Vendor B</span>
          <select
            name="vendorBId"
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select...</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.category.name})
              </option>
            ))}
          </select>
        </label>
      </FormSection>
      <SubmitButton label="Create comparison" />
    </form>
  );
}
```

- [ ] **Step 2: List page**

`src/app/admin/comparisons/page.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { AdminPageHeader, AdminPrimaryLink } from "@/app/admin/_components/AdminPageHeader";
import { AdminTable } from "@/app/admin/_components/AdminTable";

export default async function ComparisonsPage() {
  const comparisons = await db.comparison.findMany({
    orderBy: [{ updatedAt: "desc" }],
    include: { vendorA: true, vendorB: true },
  });

  return (
    <div>
      <AdminPageHeader
        title="Comparisons"
        actions={<AdminPrimaryLink href="/admin/comparisons/new">New comparison</AdminPrimaryLink>}
      />
      {comparisons.length === 0 ? (
        <AdminTable headers={["Slug", "Vendor A", "Vendor B", "Published"]} empty="No comparisons yet.">
          {null}
        </AdminTable>
      ) : (
        <AdminTable headers={["Slug", "Vendor A", "Vendor B", "Published"]}>
          {comparisons.map((c) => (
            <tr key={c.id}>
              <td className="px-4 py-2">
                <Link href={`/admin/comparisons/${c.slug}`} className="font-medium text-slate-900 hover:underline">
                  {c.slug}
                </Link>
              </td>
              <td className="px-4 py-2 text-slate-600">{c.vendorA.name}</td>
              <td className="px-4 py-2 text-slate-600">{c.vendorB.name}</td>
              <td className="px-4 py-2 text-slate-600">{c.isPublished ? "Yes" : "No"}</td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
```

- [ ] **Step 3: New page**

`src/app/admin/comparisons/new/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { NewComparisonForm } from "../_components/ComparisonForm";
import { createComparisonAction } from "../actions";

export default async function NewComparisonPage() {
  const vendors = await db.vendor.findMany({
    where: { status: "published" },
    orderBy: { name: "asc" },
    include: { category: { select: { name: true } } },
  });

  return (
    <div>
      <AdminPageHeader
        title="New comparison"
        description="Pick two published vendors. The slug is auto-generated from their names (alphabetical)."
      />
      <NewComparisonForm action={createComparisonAction} vendors={vendors} />
    </div>
  );
}
```

- [ ] **Step 4: Edit page**

`src/app/admin/comparisons/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { DeleteButton } from "@/app/admin/_components/DeleteButton";
import { ComparisonEditForm } from "../_components/ComparisonForm";
import { updateComparisonAction, deleteComparisonAction } from "../actions";

export default async function EditComparisonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const cmp = await db.comparison.findUnique({
    where: { slug },
    include: { vendorA: true, vendorB: true },
  });
  if (!cmp) notFound();

  return (
    <div>
      <AdminPageHeader
        title={`${cmp.vendorA.name} vs ${cmp.vendorB.name}`}
        description={`/compare/${cmp.slug}`}
        actions={
          <DeleteButton
            confirmMessage="Delete this comparison?"
            action={async () => {
              "use server";
              await deleteComparisonAction(cmp.id);
            }}
          />
        }
      />
      <ComparisonEditForm
        action={updateComparisonAction}
        initial={{
          id: cmp.id,
          slug: cmp.slug,
          hookCopy: cmp.hookCopy,
          summaryCopy: cmp.summaryCopy,
          verdictCopy: cmp.verdictCopy,
          isPublished: cmp.isPublished,
        }}
      />
    </div>
  );
}
```

- [ ] **Step 5: TS + tests**

```bash
pnpm tsc --noEmit && pnpm test
```

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/comparisons/
git commit -m "feat(m2): comparisons list, new (pair picker), and edit pages"
```

---

## Task 11: Buyer Guides CRUD - server actions with TDD

**Files:**
- Create: `src/app/admin/buyer-guides/actions.ts`, `tests/admin/buyer-guides.actions.test.ts`

- [ ] **Step 1: Write failing tests**

`tests/admin/buyer-guides.actions.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { createBuyerGuideAction, updateBuyerGuideAction, deleteBuyerGuideAction } from "@/app/admin/buyer-guides/actions";

vi.mock("@/lib/db", () => ({
  db: {
    buyerGuide: { create: vi.fn(), update: vi.fn(), delete: vi.fn() },
  },
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn((u: string) => { throw new Error(`REDIRECT:${u}`); }),
}));

import { db } from "@/lib/db";

describe("createBuyerGuideAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("creates with category-derived slug", async () => {
    vi.mocked(db.buyerGuide.create).mockResolvedValueOnce({ slug: "debt-buyers-guide" } as never);

    const fd = new FormData();
    fd.set("title", "Debt buyers guide");
    fd.set("categoryId", "cat1");
    fd.set("bodyMarkdown", "# Hello");

    await expect(createBuyerGuideAction(fd)).rejects.toThrow(
      "REDIRECT:/admin/buyer-guides/debt-buyers-guide",
    );

    expect(db.buyerGuide.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        slug: "debt-buyers-guide",
        title: "Debt buyers guide",
        categoryId: "cat1",
        bodyMarkdown: "# Hello",
        isPublished: false,
      }),
    });
  });
});

describe("updateBuyerGuideAction", () => {
  beforeEach(() => vi.clearAllMocks());

  it("updates by id", async () => {
    vi.mocked(db.buyerGuide.update).mockResolvedValueOnce({ slug: "x" } as never);
    const fd = new FormData();
    fd.set("id", "g1");
    fd.set("slug", "x");
    fd.set("title", "X");
    fd.set("categoryId", "c1");
    fd.set("bodyMarkdown", "body");
    fd.set("isPublished", "on");
    await expect(updateBuyerGuideAction(fd)).rejects.toThrow("REDIRECT:/admin/buyer-guides/x");
  });
});
```

- [ ] **Step 2: Implement**

`src/app/admin/buyer-guides/actions.ts`:

```typescript
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
```

- [ ] **Step 3: Run tests, expect pass**

```bash
pnpm test buyer-guides
```

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/buyer-guides/actions.ts tests/admin/buyer-guides.actions.test.ts
git commit -m "feat(m2): buyer guide server actions (create/update/delete) with tests"
```

---

## Task 12: Buyer Guides UI - list, new, edit (markdown textarea)

**Files:**
- Create: `src/app/admin/buyer-guides/page.tsx`, `src/app/admin/buyer-guides/new/page.tsx`, `src/app/admin/buyer-guides/[slug]/page.tsx`, `src/app/admin/buyer-guides/_components/BuyerGuideForm.tsx`

- [ ] **Step 1: Form component**

`src/app/admin/buyer-guides/_components/BuyerGuideForm.tsx`:

```tsx
import { FormField } from "@/app/admin/_components/FormField";
import { FormSection } from "@/app/admin/_components/FormSection";
import { SubmitButton } from "@/app/admin/_components/SubmitButton";

export function BuyerGuideForm({
  action,
  initial,
  categories,
  submitLabel,
}: {
  action: (fd: FormData) => Promise<void>;
  initial?: {
    id?: string;
    slug?: string;
    title?: string;
    categoryId?: string;
    bodyMarkdown?: string;
    isPublished?: boolean;
  };
  categories: { id: string; name: string }[];
  submitLabel: string;
}) {
  return (
    <form action={action} className="space-y-6 max-w-3xl">
      {initial?.id ? <input type="hidden" name="id" defaultValue={initial.id} /> : null}
      {initial?.slug ? <input type="hidden" name="slug" defaultValue={initial.slug} /> : null}
      <FormSection title="Basics">
        <FormField label="Title" name="title" defaultValue={initial?.title} required />
        <label className="block">
          <span className="block text-sm font-medium text-slate-700">Category</span>
          <select
            name="categoryId"
            defaultValue={initial?.categoryId}
            required
            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="">Select...</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
      </FormSection>
      <FormSection title="Body (markdown)">
        <FormField
          label="Markdown"
          name="bodyMarkdown"
          defaultValue={initial?.bodyMarkdown ?? ""}
          textarea
          rows={20}
          helpText="Plain markdown. Live preview lands in M3 alongside public rendering."
        />
      </FormSection>
      {initial?.id ? (
        <FormSection title="Publish">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={initial?.isPublished ?? false}
            />
            Published
          </label>
        </FormSection>
      ) : null}
      <SubmitButton label={submitLabel} />
    </form>
  );
}
```

- [ ] **Step 2: List page**

`src/app/admin/buyer-guides/page.tsx`:

```tsx
import Link from "next/link";
import { db } from "@/lib/db";
import { AdminPageHeader, AdminPrimaryLink } from "@/app/admin/_components/AdminPageHeader";
import { AdminTable } from "@/app/admin/_components/AdminTable";

export default async function BuyerGuidesPage() {
  const guides = await db.buyerGuide.findMany({
    orderBy: { updatedAt: "desc" },
    include: { category: true },
  });

  return (
    <div>
      <AdminPageHeader
        title="Buyer Guides"
        actions={<AdminPrimaryLink href="/admin/buyer-guides/new">New buyer guide</AdminPrimaryLink>}
      />
      {guides.length === 0 ? (
        <AdminTable headers={["Title", "Category", "Published"]} empty="No buyer guides yet.">
          {null}
        </AdminTable>
      ) : (
        <AdminTable headers={["Title", "Category", "Published"]}>
          {guides.map((g) => (
            <tr key={g.id}>
              <td className="px-4 py-2">
                <Link href={`/admin/buyer-guides/${g.slug}`} className="font-medium text-slate-900 hover:underline">
                  {g.title}
                </Link>
              </td>
              <td className="px-4 py-2 text-slate-600">{g.category.name}</td>
              <td className="px-4 py-2 text-slate-600">{g.isPublished ? "Yes" : "No"}</td>
            </tr>
          ))}
        </AdminTable>
      )}
    </div>
  );
}
```

- [ ] **Step 3: New page**

`src/app/admin/buyer-guides/new/page.tsx`:

```tsx
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { BuyerGuideForm } from "../_components/BuyerGuideForm";
import { createBuyerGuideAction } from "../actions";

export default async function NewBuyerGuidePage() {
  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return (
    <div>
      <AdminPageHeader title="New buyer guide" />
      <BuyerGuideForm action={createBuyerGuideAction} categories={categories} submitLabel="Create buyer guide" />
    </div>
  );
}
```

- [ ] **Step 4: Edit page**

`src/app/admin/buyer-guides/[slug]/page.tsx`:

```tsx
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { AdminPageHeader } from "@/app/admin/_components/AdminPageHeader";
import { DeleteButton } from "@/app/admin/_components/DeleteButton";
import { BuyerGuideForm } from "../_components/BuyerGuideForm";
import { updateBuyerGuideAction, deleteBuyerGuideAction } from "../actions";

export default async function EditBuyerGuidePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [guide, categories] = await Promise.all([
    db.buyerGuide.findUnique({ where: { slug }, include: { category: true } }),
    db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ]);
  if (!guide) notFound();

  return (
    <div>
      <AdminPageHeader
        title={guide.title}
        description={`/${guide.category.slug}/buyers-guide`}
        actions={
          <DeleteButton
            confirmMessage={`Delete buyer guide "${guide.title}"?`}
            action={async () => {
              "use server";
              await deleteBuyerGuideAction(guide.id);
            }}
          />
        }
      />
      <BuyerGuideForm
        action={updateBuyerGuideAction}
        categories={categories}
        initial={{ ...guide }}
        submitLabel="Save changes"
      />
    </div>
  );
}
```

- [ ] **Step 5: Smoke test, TS, tests**

```bash
pnpm tsc --noEmit && pnpm test
```

- [ ] **Step 6: Final commit + push + deploy**

```bash
git add src/app/admin/buyer-guides/
git commit -m "feat(m2): buyer guides list, new, and edit pages"

# Push to GitHub (use the same token approach as M1):
GH_TOKEN="..." git push "https://${GH_TOKEN}@github.com/barelezra10-create/B2bhub.git" HEAD:m1-foundation
git checkout main && git merge --ff-only m1-foundation
GH_TOKEN="..." git push "https://${GH_TOKEN}@github.com/barelezra10-create/B2bhub.git" HEAD:main

# Trigger Railway deploy
railway up --ci
```

After deploy succeeds, smoke test the live site at the existing Railway URL:

```bash
URL="https://web-production-930b0.up.railway.app"
curl -sS -c /tmp/c.txt -X POST "$URL/api/auth/login" \
  -H 'content-type: application/json' \
  -d '{"email":"bar@albert-capital.com","password":"<your password>"}' \
  -w "\nLOGIN %{http_code}\n"
curl -sS -b /tmp/c.txt "$URL/admin/categories" -o /dev/null -w "CATEGORIES %{http_code}\n"
curl -sS -b /tmp/c.txt "$URL/admin/vendors" -o /dev/null -w "VENDORS %{http_code}\n"
curl -sS -b /tmp/c.txt "$URL/admin/comparisons" -o /dev/null -w "COMPARISONS %{http_code}\n"
curl -sS -b /tmp/c.txt "$URL/admin/buyer-guides" -o /dev/null -w "GUIDES %{http_code}\n"
```

Expected: all 200.

---

## Self-Review

After all 12 tasks:

- [ ] All 4 entity types CRUD-able from admin (list + create + edit + delete).
- [ ] Categories list shows vendor counts.
- [ ] Vendor edit form sectioned (Basics, Company, Pricing, Editorial, Sponsorship & Lead routing, Publish).
- [ ] Comparisons new page shows only published vendors.
- [ ] Buyer Guides edit form has a markdown textarea (no live preview yet).
- [ ] All Server Actions covered by unit tests with mocked db.
- [ ] `pnpm test` passes (existing 7 + new ~13 = ~20 total).
- [ ] `pnpm tsc --noEmit` clean.
- [ ] Live admin works end-to-end on Railway.

---

## What's Next

M3 (Public Page Templates) takes the data populated via M2's admin and renders the 6 page types from the Phase 1 spec:
- `/[category]` - category overview
- `/[category]/best` - top-N
- `/[category]/[vendor]` - vendor profile
- `/[category]/[vendor]-alternatives` - alternatives
- `/compare/[vendor-a]-vs-[vendor-b]` - vs page
- `/[category]/buyers-guide` - buyer guide

M3 also wires `revalidatePath()` from M2's actions to the public routes, so admin edits show up on the public site within ~1 second.
