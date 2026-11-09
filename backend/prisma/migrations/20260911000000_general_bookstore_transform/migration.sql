-- Migration: general_bookstore_transform
-- Transforms the university bookshop schema into a general-purpose bookstore platform.
-- This migration is ADDITIVE only -- no existing data is deleted.

-- Step 1: Rename Role enum values
ALTER TYPE "Role" RENAME VALUE 'student' TO 'customer';
ALTER TYPE "Role" RENAME VALUE 'admin' TO 'seller';

-- Step 2: Update User table default role
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'customer';

-- Step 3: Add new NotificationType enum values
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'NEW_SALE';
ALTER TYPE "NotificationType" ADD VALUE IF NOT EXISTS 'LOW_STOCK';

-- Step 4: Create BookCondition enum
DO $$ BEGIN
    CREATE TYPE "BookCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 5: Extend Bookshop table with business info fields
ALTER TABLE "Bookshop" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Bookshop" ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE "Bookshop" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "Bookshop" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Bookshop" ADD COLUMN IF NOT EXISTS "address" TEXT;
ALTER TABLE "Bookshop" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Bookshop" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "Bookshop" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "Bookshop" ADD COLUMN IF NOT EXISTS "openingHours" TEXT;

-- Step 6: Create Subcategory table
CREATE TABLE IF NOT EXISTS "Subcategory" (
    "id"         TEXT NOT NULL,
    "name"       TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Subcategory_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Subcategory" ADD CONSTRAINT "Subcategory_categoryId_fkey"
    FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS "Subcategory_categoryId_name_key" ON "Subcategory"("categoryId", "name");
CREATE INDEX IF NOT EXISTS "Subcategory_categoryId_idx" ON "Subcategory"("categoryId");

-- Step 7: Extend Book table with new fields
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "subcategoryId"    TEXT;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "targetAudience"   TEXT;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "bookCondition"    "BookCondition" NOT NULL DEFAULT 'NEW';
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "isbn"             TEXT;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "publisher"        TEXT;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "edition"          TEXT;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "publicationYear"  INTEGER;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "numberOfPages"    INTEGER;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "language"         TEXT DEFAULT 'English';
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "tableOfContents"  TEXT;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "bookAnatomy"      TEXT;
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "previewPages"     TEXT[] DEFAULT ARRAY[]::TEXT[];
ALTER TABLE "Book" ADD COLUMN IF NOT EXISTS "tags"             TEXT[] DEFAULT ARRAY[]::TEXT[];

-- Step 8: Add foreign key for Book.subcategoryId -> Subcategory
ALTER TABLE "Book" ADD CONSTRAINT "Book_subcategoryId_fkey"
    FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Step 9: Create indexes for new Book fields
CREATE INDEX IF NOT EXISTS "Book_isbn_idx"          ON "Book"("isbn");
CREATE INDEX IF NOT EXISTS "Book_categoryId_idx"    ON "Book"("categoryId");
CREATE INDEX IF NOT EXISTS "Book_subcategoryId_idx" ON "Book"("subcategoryId");
