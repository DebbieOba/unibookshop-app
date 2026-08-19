-- DropIndex
DROP INDEX IF EXISTS "Category_name_key";

-- DropIndex
DROP INDEX IF EXISTS "Level_name_key";

-- DropIndex
DROP INDEX IF EXISTS "School_name_key";

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "bookshopId" TEXT,
ADD COLUMN     "costPrice" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "bookshopId" TEXT;

-- AlterTable
ALTER TABLE "Level" ADD COLUMN     "bookshopId" TEXT;

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "bookshopId" TEXT;

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN     "bookshopId" TEXT;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "bookshopId" TEXT;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "costPriceSnapshot" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "PromoCode" ADD COLUMN     "bookshopId" TEXT;

-- AlterTable
ALTER TABLE "School" ADD COLUMN     "bookshopId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bookshopId" TEXT;

-- CreateTable
CREATE TABLE "Bookshop" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bookshop_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Bookshop_name_key" ON "Bookshop"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Bookshop_slug_key" ON "Bookshop"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Category_bookshopId_name_key" ON "Category"("bookshopId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Level_bookshopId_name_key" ON "Level"("bookshopId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "School_bookshopId_name_key" ON "School"("bookshopId", "name");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_bookshopId_fkey" FOREIGN KEY ("bookshopId") REFERENCES "Bookshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "School" ADD CONSTRAINT "School_bookshopId_fkey" FOREIGN KEY ("bookshopId") REFERENCES "Bookshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Level" ADD CONSTRAINT "Level_bookshopId_fkey" FOREIGN KEY ("bookshopId") REFERENCES "Bookshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_bookshopId_fkey" FOREIGN KEY ("bookshopId") REFERENCES "Bookshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Book" ADD CONSTRAINT "Book_bookshopId_fkey" FOREIGN KEY ("bookshopId") REFERENCES "Bookshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_bookshopId_fkey" FOREIGN KEY ("bookshopId") REFERENCES "Bookshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_bookshopId_fkey" FOREIGN KEY ("bookshopId") REFERENCES "Bookshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_bookshopId_fkey" FOREIGN KEY ("bookshopId") REFERENCES "Bookshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_bookshopId_fkey" FOREIGN KEY ("bookshopId") REFERENCES "Bookshop"("id") ON DELETE CASCADE ON UPDATE CASCADE;
