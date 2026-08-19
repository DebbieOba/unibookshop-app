import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';

@Injectable()
export class FavouritesService {
  constructor(private readonly prisma: PrismaService) {}

  findMine(userId: string) {
    return this.prisma.favourite.findMany({
      where: { userId },
      include: { book: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  add(userId: string, bookId: string) {
    return this.prisma.favourite.upsert({
      where: { userId_bookId: { userId, bookId } },
      create: { userId, bookId },
      update: {},
    });
  }

  async remove(userId: string, bookId: string) {
    await this.prisma.favourite.deleteMany({ where: { userId, bookId } });
  }
}
