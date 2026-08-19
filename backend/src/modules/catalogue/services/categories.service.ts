import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { CreateCategoryDto } from '../dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(bookshopId?: string) {
    return this.prisma.category.findMany({
      where: {
        ...(bookshopId && { bookshopId }),
      },
      orderBy: { name: 'asc' },
    });
  }

  create(dto: CreateCategoryDto, bookshopId?: string | null) {
    return this.prisma.category.create({
      data: {
        ...dto,
        bookshopId: bookshopId ?? undefined,
      },
    });
  }

  async remove(id: string, bookshopId?: string | null) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Category not found');
    if (bookshopId && existing.bookshopId && existing.bookshopId !== bookshopId) {
      throw new BadRequestException('You do not have access to this category');
    }
    return this.prisma.category.delete({ where: { id } });
  }
}
