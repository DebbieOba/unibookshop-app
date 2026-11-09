import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';

@Injectable()
export class SubcategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(categoryId?: string) {
    return this.prisma.subcategory.findMany({
      where: categoryId ? { categoryId } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const subcategory = await this.prisma.subcategory.findUnique({
      where: { id },
    });
    if (!subcategory) throw new NotFoundException('Subcategory not found');
    return subcategory;
  }

  async create(categoryId: string, name: string) {
    return this.prisma.subcategory.create({
      data: { name, categoryId },
    });
  }

  async update(id: string, name: string) {
    return this.prisma.subcategory.update({
      where: { id },
      data: { name },
    });
  }

  async remove(id: string) {
    return this.prisma.subcategory.delete({
      where: { id },
    });
  }
}
