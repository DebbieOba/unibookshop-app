import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';

@Injectable()
export class PreOrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findMine(userId: string) {
    return this.prisma.preOrderReservation.findMany({
      where: { userId },
      include: { book: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async reserve(userId: string, bookId: string) {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Book not found');
    if (!book.isPreOrder) {
      throw new BadRequestException('This book is not open for pre-order');
    }

    return this.prisma.preOrderReservation.upsert({
      where: { userId_bookId: { userId, bookId } },
      create: { userId, bookId },
      update: {},
    });
  }

  async cancel(userId: string, bookId: string) {
    await this.prisma.preOrderReservation.deleteMany({
      where: { userId, bookId },
    });
  }
}
