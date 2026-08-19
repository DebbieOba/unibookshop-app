import { Test } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BooksService } from './books.service';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { UploadService } from '../../../integrations/object-storage/upload.service';
import { NotifyService } from '../../notification/notification.public-api';

describe('BooksService', () => {
  let service: BooksService;
  let prisma: {
    book: { findUnique: jest.Mock; update: jest.Mock; create: jest.Mock };
    preOrderReservation: { findMany: jest.Mock; deleteMany: jest.Mock };
  };
  let notify: { notifyUser: jest.Mock };

  beforeEach(async () => {
    prisma = {
      book: { findUnique: jest.fn(), update: jest.fn(), create: jest.fn() },
      preOrderReservation: { findMany: jest.fn(), deleteMany: jest.fn() },
    };
    notify = { notifyUser: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        BooksService,
        { provide: PrismaService, useValue: prisma },
        { provide: UploadService, useValue: { uploadImage: jest.fn() } },
        { provide: NotifyService, useValue: notify },
      ],
    }).compile();

    service = module.get(BooksService);
  });

  describe('update', () => {
    it('throws NotFoundException when the book does not exist', async () => {
      prisma.book.findUnique.mockResolvedValue(null);
      await expect(service.update('missing', { title: 'X' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rejects a compareAtPrice that is not greater than price', async () => {
      prisma.book.findUnique.mockResolvedValue({
        id: 'b1',
        price: 1000,
        isPreOrder: false,
      });
      await expect(
        service.update('b1', { compareAtPrice: 900 }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.book.update).not.toHaveBeenCalled();
    });

    it('does nothing pre-order-related on a plain update', async () => {
      prisma.book.findUnique.mockResolvedValue({
        id: 'b1',
        price: 1000,
        isPreOrder: false,
      });
      prisma.book.update.mockResolvedValue({
        id: 'b1',
        title: 'Updated',
        isPreOrder: false,
      });

      await service.update('b1', { title: 'Updated' });

      expect(prisma.preOrderReservation.findMany).not.toHaveBeenCalled();
      expect(notify.notifyUser).not.toHaveBeenCalled();
    });

    it('notifies every reserver and clears reservations when a pre-order book becomes available', async () => {
      prisma.book.findUnique.mockResolvedValue({
        id: 'b1',
        price: 1000,
        isPreOrder: true,
        title: 'Old Title',
      });
      prisma.book.update.mockResolvedValue({
        id: 'b1',
        title: 'Advanced Circuits',
        isPreOrder: false,
      });
      prisma.preOrderReservation.findMany.mockResolvedValue([
        {
          userId: 'u1',
          bookId: 'b1',
          user: { id: 'u1', email: 'a@example.com' },
        },
        {
          userId: 'u2',
          bookId: 'b1',
          user: { id: 'u2', email: 'b@example.com' },
        },
      ]);

      await service.update('b1', { isPreOrder: false, stockQuantity: 20 });

      expect(notify.notifyUser).toHaveBeenCalledTimes(2);
      expect(notify.notifyUser).toHaveBeenCalledWith(
        { id: 'u1', email: 'a@example.com' },
        expect.objectContaining({
          type: 'NEW_ARRIVAL',
          title: 'Pre-order now available',
        }),
      );
      expect(prisma.preOrderReservation.deleteMany).toHaveBeenCalledWith({
        where: { bookId: 'b1' },
      });
    });

    it('does not notify when isPreOrder stays true', async () => {
      prisma.book.findUnique.mockResolvedValue({
        id: 'b1',
        price: 1000,
        isPreOrder: true,
      });
      prisma.book.update.mockResolvedValue({ id: 'b1', isPreOrder: true });

      await service.update('b1', { stockQuantity: 5 });

      expect(prisma.preOrderReservation.findMany).not.toHaveBeenCalled();
      expect(notify.notifyUser).not.toHaveBeenCalled();
    });
  });
});
