import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from '../dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateExpenseDto, bookshopId: string) {
    if (!bookshopId) {
      throw new BadRequestException('Seller must be associated with a bookshop');
    }

    return this.prisma.expense.create({
      data: {
        amount: dto.amount,
        description: dto.description,
        category: dto.category,
        date: dto.date ? new Date(dto.date) : new Date(),
        bookshopId,
      },
    });
  }

  async findAll(bookshopId: string, startDate?: string, endDate?: string) {
    if (!bookshopId) return [];

    const where: any = { bookshopId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setUTCHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    return this.prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
    });
  }

  async update(id: string, dto: UpdateExpenseDto, bookshopId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, bookshopId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    const data: any = {};
    if (dto.amount !== undefined) data.amount = dto.amount;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.category !== undefined) data.category = dto.category;
    if (dto.date !== undefined) data.date = new Date(dto.date);

    return this.prisma.expense.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, bookshopId: string) {
    const expense = await this.prisma.expense.findFirst({
      where: { id, bookshopId },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return this.prisma.expense.delete({
      where: { id },
    });
  }
}
