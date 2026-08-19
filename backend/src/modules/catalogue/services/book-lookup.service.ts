import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';

export interface BookSnapshot {
  id: string;
  title: string;
  price: number;
  compareAtPrice: number | null;
  costPrice: number;
}

@Injectable()
export class BookLookupService {
  constructor(private readonly prisma: PrismaService) {}

  async getSnapshot(bookId: string): Promise<BookSnapshot> {
    const book = await this.prisma.book.findUnique({ where: { id: bookId } });
    if (!book) throw new NotFoundException('Book not found');
    return {
      id: book.id,
      title: book.title,
      price: Number(book.price),
      compareAtPrice: book.compareAtPrice !== null ? Number(book.compareAtPrice) : null,
      costPrice: Number(book.costPrice),
    };
  }
}
