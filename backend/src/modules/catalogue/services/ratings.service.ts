import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';

@Injectable()
export class RatingsService {
  constructor(private readonly prisma: PrismaService) {}

  rate(bookId: string, userId: string, score: number, comment?: string) {
    return this.prisma.rating.upsert({
      where: { bookId_userId: { bookId, userId } },
      create: { bookId, userId, score, comment },
      update: { score, comment },
    });
  }

  findForBook(bookId: string) {
    return this.prisma.rating.findMany({ where: { bookId } });
  }
}
