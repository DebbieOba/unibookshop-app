import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';

export interface UpdateBookshopDto {
  name?: string;
  description?: string;
  logoUrl?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  openingHours?: string;
}

@Injectable()
export class BookshopService {
  constructor(private readonly prisma: PrismaService) {}

  async findOne(id: string) {
    const bookshop = await this.prisma.bookshop.findUnique({
      where: { id },
    });
    if (!bookshop) throw new NotFoundException('Bookshop not found');
    return bookshop;
  }

  async update(id: string, dto: UpdateBookshopDto) {
    return this.prisma.bookshop.update({
      where: { id },
      data: dto,
    });
  }
}
