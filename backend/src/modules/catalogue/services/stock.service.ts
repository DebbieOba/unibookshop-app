import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Book, InventoryMovement, InventoryMovementType } from '@prisma/client';
import { PrismaService } from '../../../database/postgres/prisma.service';

export interface AdjustStockInput {
  type: InventoryMovementType;
  quantityDelta: number;
  reason: string;
}

@Injectable()
export class StockService {
  constructor(private readonly prisma: PrismaService) {}

  async checkAvailability(bookId: string, quantity: number): Promise<boolean> {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Book not found');
    return book.stockQuantity >= quantity;
  }

  async reserveStock(bookId: string, quantity: number): Promise<void> {
    const result = await this.prisma.book.updateMany({
      where: { id: bookId, stockQuantity: { gte: quantity } },
      data: { stockQuantity: { decrement: quantity } },
    });
    if (result.count === 0) {
      throw new BadRequestException('Insufficient stock');
    }
  }

  async releaseStock(bookId: string, quantity: number): Promise<void> {
    await this.prisma.book.update({
      where: { id: bookId },
      data: { stockQuantity: { increment: quantity } },
    });
  }

  /**
   * Admin-initiated stock correction (restock, damage, return, etc.) — distinct
   * from reserveStock/releaseStock, which exist purely to support checkout.
   * Writes a discrete InventoryMovement row in the same transaction as the
   * stock write, so the log can never diverge from what actually happened.
   */
  async adjustStock(
    bookId: string,
    input: AdjustStockInput,
    actorId: string,
  ): Promise<{ book: Book; movement: InventoryMovement }> {
    if (input.quantityDelta === 0) {
      throw new BadRequestException('quantityDelta must be non-zero');
    }

    return this.prisma.$transaction(async (tx) => {
      let book: Book;
      if (input.quantityDelta < 0) {
        const result = await tx.book.updateMany({
          where: { id: bookId, stockQuantity: { gte: -input.quantityDelta } },
          data: { stockQuantity: { increment: input.quantityDelta } },
        });
        if (result.count === 0) {
          const existing = await tx.book.findUnique({ where: { id: bookId } });
          if (!existing) throw new NotFoundException('Book not found');
          throw new BadRequestException(
            'Adjustment would reduce stock below zero',
          );
        }
        book = await tx.book.findUniqueOrThrow({ where: { id: bookId } });
      } else {
        try {
          book = await tx.book.update({
            where: { id: bookId },
            data: { stockQuantity: { increment: input.quantityDelta } },
          });
        } catch {
          throw new NotFoundException('Book not found');
        }
      }

      const movement = await tx.inventoryMovement.create({
        data: {
          bookId,
          type: input.type,
          quantityDelta: input.quantityDelta,
          reason: input.reason,
          resultingQuantity: book.stockQuantity,
          actorId,
        },
      });

      return { book, movement };
    });
  }
}
