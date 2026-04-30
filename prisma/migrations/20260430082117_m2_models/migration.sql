-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('free', 'freemium', 'paid', 'quote');

-- CreateEnum
CREATE TYPE "Segment" AS ENUM ('smb', 'mid_market', 'enterprise', 'all');

-- CreateEnum
CREATE TYPE "SponsorTier" AS ENUM ('none', 'featured', 'premium');

-- CreateEnum
CREATE TYPE "VendorStatus" AS ENUM ('draft', 'published');

-- CreateEnum
CREATE TYPE "LeadIntent" AS ENUM ('evaluating', 'ready_to_buy', 'just_looking');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('new', 'sent_to_vendor', 'qualified', 'disqualified');

-- CreateEnum
CREATE TYPE "PlacementType" AS ENUM ('top_of_category', 'featured_compare', 'sidebar');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "heroImage" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Vendor" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "websiteUrl" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "tagline" TEXT,
    "descriptionShort" TEXT,
    "descriptionLong" TEXT,
    "foundedYear" INTEGER,
    "hqLocation" TEXT,
    "employeeCountRange" TEXT,
    "pricingModel" "PricingModel" NOT NULL DEFAULT 'quote',
    "pricingStartingAt" TEXT,
    "pricingNotes" TEXT,
    "bestForSegment" "Segment" NOT NULL DEFAULT 'all',
    "ourScore" INTEGER,
    "ourScoreNotes" TEXT,
    "pros" TEXT[],
    "cons" TEXT[],
    "keyFeatures" TEXT[],
    "integrations" TEXT[],
    "isClaimed" BOOLEAN NOT NULL DEFAULT false,
    "isPaidSponsor" BOOLEAN NOT NULL DEFAULT false,
    "sponsorTier" "SponsorTier" NOT NULL DEFAULT 'none',
    "sponsorRankBoost" INTEGER NOT NULL DEFAULT 0,
    "leadFormEnabled" BOOLEAN NOT NULL DEFAULT true,
    "leadDestination" TEXT,
    "affiliateUrl" TEXT,
    "status" "VendorStatus" NOT NULL DEFAULT 'draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VendorScreenshot" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "caption" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VendorScreenshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comparison" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "vendorAId" TEXT NOT NULL,
    "vendorBId" TEXT NOT NULL,
    "hookCopy" TEXT,
    "summaryCopy" TEXT,
    "verdictCopy" TEXT,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BuyerGuide" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "bodyMarkdown" TEXT NOT NULL,
    "tableOfContents" JSONB,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BuyerGuide_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT,
    "categoryId" TEXT,
    "pagePath" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "companyName" TEXT,
    "companySize" TEXT,
    "intent" "LeadIntent" NOT NULL DEFAULT 'evaluating',
    "message" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'new',
    "vendorEmailSentAt" TIMESTAMP(3),
    "internalNotes" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "gclid" TEXT,
    "referrer" TEXT,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SponsoredPlacement" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "categoryId" TEXT,
    "placementType" "PlacementType" NOT NULL,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "monthlyRate" DECIMAL(10,2) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SponsoredPlacement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_slug_key" ON "Vendor"("slug");

-- CreateIndex
CREATE INDEX "Vendor_categoryId_idx" ON "Vendor"("categoryId");

-- CreateIndex
CREATE INDEX "Vendor_status_idx" ON "Vendor"("status");

-- CreateIndex
CREATE INDEX "Vendor_sponsorTier_idx" ON "Vendor"("sponsorTier");

-- CreateIndex
CREATE INDEX "VendorScreenshot_vendorId_idx" ON "VendorScreenshot"("vendorId");

-- CreateIndex
CREATE UNIQUE INDEX "Comparison_slug_key" ON "Comparison"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Comparison_vendorAId_vendorBId_key" ON "Comparison"("vendorAId", "vendorBId");

-- CreateIndex
CREATE UNIQUE INDEX "BuyerGuide_slug_key" ON "BuyerGuide"("slug");

-- CreateIndex
CREATE INDEX "BuyerGuide_categoryId_idx" ON "BuyerGuide"("categoryId");

-- CreateIndex
CREATE INDEX "Lead_vendorId_idx" ON "Lead"("vendorId");

-- CreateIndex
CREATE INDEX "Lead_categoryId_idx" ON "Lead"("categoryId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "SponsoredPlacement_vendorId_idx" ON "SponsoredPlacement"("vendorId");

-- CreateIndex
CREATE INDEX "SponsoredPlacement_isActive_idx" ON "SponsoredPlacement"("isActive");

-- AddForeignKey
ALTER TABLE "Vendor" ADD CONSTRAINT "Vendor_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VendorScreenshot" ADD CONSTRAINT "VendorScreenshot_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_vendorAId_fkey" FOREIGN KEY ("vendorAId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comparison" ADD CONSTRAINT "Comparison_vendorBId_fkey" FOREIGN KEY ("vendorBId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuyerGuide" ADD CONSTRAINT "BuyerGuide_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsoredPlacement" ADD CONSTRAINT "SponsoredPlacement_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "Vendor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SponsoredPlacement" ADD CONSTRAINT "SponsoredPlacement_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
