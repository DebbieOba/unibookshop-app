-- CreateEnum
CREATE TYPE "InventoryMovementType" AS ENUM ('RESTOCK', 'DAMAGE', 'CORRECTION', 'RETURN', 'MANUAL_REDUCTION');

-- AlterEnum
ALTER TYPE "AccountState" ADD VALUE 'RESTRICTED';

-- AlterTable
ALTER TABLE "Book" ADD COLUMN     "reorderThreshold" INTEGER;

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "adminStatusReason" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "restrictionReason" TEXT;

-- CreateTable
CREATE TABLE "InventoryMovement" (
    "id" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "type" "InventoryMovementType" NOT NULL,
    "quantityDelta" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "resultingQuantity" INTEGER NOT NULL,
    "actorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InventoryMovement_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "InventoryMovement_bookId_idx" ON "InventoryMovement"("bookId");

-- CreateIndex
CREATE INDEX "InventoryMovement_createdAt_idx" ON "InventoryMovement"("createdAt");

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InventoryMovement" ADD CONSTRAINT "InventoryMovement_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
