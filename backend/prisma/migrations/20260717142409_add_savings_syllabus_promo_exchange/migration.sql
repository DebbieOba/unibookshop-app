-- CreateEnum
CREATE TYPE "PromoType" AS ENUM ('PERCENT', 'FIXED');

-- CreateEnum
CREATE TYPE "ListingCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('AVAILABLE', 'SOLD', 'REMOVED');

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "compareAtPrice" DECIMAL(10,2),
ADD COLUMN     "courseCode" TEXT,
ADD COLUMN     "courseTitle" TEXT,
ADD COLUMN     "isPreOrder" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "releaseDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "discountAmount" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "promoCodeId" TEXT,
ADD COLUMN     "subtotalAmount" DECIMAL(10,2);

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "compareAtPriceSnapshot" DECIMAL(10,2);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "type" "PromoType" NOT NULL,
    "value" DECIMAL(10,2) NOT NULL,
    "minSubtotal" DECIMAL(10,2),
    "maxDiscount" DECIMAL(10,2),
    "expiresAt" TIMESTAMP(3),
    "usageLimit" INTEGER,
    "timesRedeemed" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "courseCode" TEXT,
    "condition" "ListingCondition" NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "description" TEXT,
    "images" TEXT[],
    "status" "ListingStatus" NOT NULL DEFAULT 'AVAILABLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_code_key" ON "PromoCode"("code");

-- CreateIndex
CREATE INDEX "Listing_status_idx" ON "Listing"("status");

-- CreateIndex
CREATE INDEX "Listing_sellerId_idx" ON "Listing"("sellerId");

-- CreateIndex
CREATE INDEX "Book_courseCode_idx" ON "Book"("courseCode");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
