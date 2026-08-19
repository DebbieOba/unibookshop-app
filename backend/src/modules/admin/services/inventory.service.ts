import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';

// Fallback for books with no per-book reorderThreshold set.
const GLOBAL_LOW_STOCK_THRESHOLD = 5;

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary() {
    // Low-stock is per-book-threshold-aware (Book.reorderThreshold overrides
    // the global default), which Prisma can't express as a single `count()`
    // where clause — comparing a column against another column. The catalogue
    // is small (~1,000s of books), so a minimal-field fetch + JS filter is
    // simpler and safer than a raw SQL query here.
    const [totalBooks, stockLevels, outOfStock] = await Promise.all([
      this.prisma.book.count(),
      this.prisma.book.findMany({
        where: { stockQuantity: { gt: 0 } },
        select: { stockQuantity: true, reorderThreshold: true },
      }),
      this.prisma.book.count({ where: { stockQuantity: 0 } }),
    ]);

    const lowStock = stockLevels.filter(
      (book) => book.stockQuantity <= (book.reorderThreshold ?? GLOBAL_LOW_STOCK_THRESHOLD),
    ).length;

    return { totalBooks, lowStock, outOfStock, lowStockThreshold: GLOBAL_LOW_STOCK_THRESHOLD };
  }
}
