import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { StockService } from './stock.service';
import { PrismaService } from '../../../database/postgres/prisma.service';

describe('StockService', () => {
  let service: StockService;
  let prisma: {
    book: {
      findUnique: jest.Mock;
      updateMany: jest.Mock;
      update: jest.Mock;
      findUniqueOrThrow: jest.Mock;
    };
    inventoryMovement: {
      create: jest.Mock;
    };
    $transaction: jest.Mock;
  };

  beforeEach(async () => {
    prisma = {
      book: {
        findUnique: jest.fn(),
        updateMany: jest.fn(),
        update: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      inventoryMovement: {
        create: jest.fn(),
      },
      // adjustStock runs inside $transaction — the mock just invokes the
      // callback with the same mocked client, same idiom every Nest+Prisma
      // test needing $transaction coverage uses.
      $transaction: jest.fn((callback: (tx: unknown) => unknown) => callback(prisma)),
    };

    const module = await Test.createTestingModule({
      providers: [StockService, { provide: PrismaService, useValue: prisma }],
    }).compile();

    service = module.get(StockService);
  });

  describe('checkAvailability', () => {
    it('returns true when stock covers the requested quantity', async () => {
      prisma.book.findUnique.mockResolvedValue({ id: 'book-1', stockQuantity: 5 });
      await expect(service.checkAvailability('book-1', 3)).resolves.toBe(true);
    });

    it('returns false when stock is insufficient', async () => {
      prisma.book.findUnique.mockResolvedValue({ id: 'book-1', stockQuantity: 1 });
      await expect(service.checkAvailability('book-1', 3)).resolves.toBe(false);
    });

    it('throws NotFoundException when the book does not exist', async () => {
      prisma.book.findUnique.mockResolvedValue(null);
      await expect(service.checkAvailability('missing', 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('reserveStock', () => {
    it('decrements stock atomically when enough is available', async () => {
      prisma.book.updateMany.mockResolvedValue({ count: 1 });
      await expect(service.reserveStock('book-1', 2)).resolves.toBeUndefined();
      expect(prisma.book.updateMany).toHaveBeenCalledWith({
        where: { id: 'book-1', stockQuantity: { gte: 2 } },
        data: { stockQuantity: { decrement: 2 } },
      });
    });

    it('throws BadRequestException when the conditional update matches nothing', async () => {
      // count: 0 is exactly how a race (two concurrent checkouts) or genuine
      // insufficient stock surfaces — the where clause is what makes this
      // atomic instead of a check-then-write race condition.
      prisma.book.updateMany.mockResolvedValue({ count: 0 });
      await expect(service.reserveStock('book-1', 100)).rejects.toThrow(BadRequestException);
    });
  });

  describe('releaseStock', () => {
    it('increments stock back', async () => {
      prisma.book.update.mockResolvedValue({});
      await service.releaseStock('book-1', 2);
      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: 'book-1' },
        data: { stockQuantity: { increment: 2 } },
      });
    });
  });

  describe('adjustStock', () => {
    it('rejects a zero delta before touching the database', async () => {
      await expect(
        service.adjustStock('book-1', { type: 'CORRECTION', quantityDelta: 0, reason: 'oops' }, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.$transaction).not.toHaveBeenCalled();
    });

    it('increments stock for a positive delta and writes a movement with the resulting quantity', async () => {
      prisma.book.update.mockResolvedValue({ id: 'book-1', stockQuantity: 12 });
      prisma.inventoryMovement.create.mockResolvedValue({ id: 'move-1' });

      const result = await service.adjustStock(
        'book-1',
        { type: 'RESTOCK', quantityDelta: 5, reason: 'New delivery' },
        'admin-1',
      );

      expect(prisma.book.update).toHaveBeenCalledWith({
        where: { id: 'book-1' },
        data: { stockQuantity: { increment: 5 } },
      });
      expect(prisma.inventoryMovement.create).toHaveBeenCalledWith({
        data: {
          bookId: 'book-1',
          type: 'RESTOCK',
          quantityDelta: 5,
          reason: 'New delivery',
          resultingQuantity: 12,
          actorId: 'admin-1',
        },
      });
      expect(result).toEqual({ book: { id: 'book-1', stockQuantity: 12 }, movement: { id: 'move-1' } });
    });

    it('reduces stock atomically for a negative delta within available stock', async () => {
      prisma.book.updateMany.mockResolvedValue({ count: 1 });
      prisma.book.findUniqueOrThrow.mockResolvedValue({ id: 'book-1', stockQuantity: 3 });
      prisma.inventoryMovement.create.mockResolvedValue({ id: 'move-2' });

      await service.adjustStock(
        'book-1',
        { type: 'DAMAGE', quantityDelta: -2, reason: 'Water damage' },
        'admin-1',
      );

      expect(prisma.book.updateMany).toHaveBeenCalledWith({
        where: { id: 'book-1', stockQuantity: { gte: 2 } },
        data: { stockQuantity: { increment: -2 } },
      });
      expect(prisma.inventoryMovement.create).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ quantityDelta: -2, resultingQuantity: 3 }) }),
      );
    });

    it('rejects a reduction that would take stock below zero, and writes no movement', async () => {
      prisma.book.updateMany.mockResolvedValue({ count: 0 });
      prisma.book.findUnique.mockResolvedValue({ id: 'book-1', stockQuantity: 1 });

      await expect(
        service.adjustStock('book-1', { type: 'DAMAGE', quantityDelta: -5, reason: 'Water damage' }, 'admin-1'),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.inventoryMovement.create).not.toHaveBeenCalled();
    });

    it('throws NotFoundException for an unknown book on a reducing adjustment', async () => {
      prisma.book.updateMany.mockResolvedValue({ count: 0 });
      prisma.book.findUnique.mockResolvedValue(null);

      await expect(
        service.adjustStock('missing', { type: 'CORRECTION', quantityDelta: -1, reason: 'n/a' }, 'admin-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
