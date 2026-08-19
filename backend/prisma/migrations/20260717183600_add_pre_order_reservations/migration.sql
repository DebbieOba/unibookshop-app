-- CreateTable
CREATE TABLE "PreOrderReservation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bookId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PreOrderReservation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreOrderReservation_userId_bookId_key" ON "PreOrderReservation"("userId", "bookId");

-- AddForeignKey
ALTER TABLE "PreOrderReservation" ADD CONSTRAINT "PreOrderReservation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PreOrderReservation" ADD CONSTRAINT "PreOrderReservation_bookId_fkey" FOREIGN KEY ("bookId") REFERENCES "Book"("id") ON DELETE CASCADE ON UPDATE CASCADE;
