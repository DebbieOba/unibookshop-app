import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { CreateExpenseDto, UpdateExpenseDto } from '../dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveBookshopId(bookshopId?: string | null): Promise<string | null> {
    if (bookshopId) return bookshopId;
    const first = await this.prisma.bookshop.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { id: true },
    });
    return first?.id ?? null;
  }

  async create(dto: CreateExpenseDto, bookshopId?: string | null) {
    const resolvedId = await this.resolveBookshopId(bookshopId);
    if (!resolvedId) {
      throw new BadRequestException('Seller must be associated with a bookshop');
    }

    return this.prisma.expense.create({
      data: {
        amount: dto.amount,
        description: dto.description,
        category: dto.category,
        date: dto.date ? new Date(dto.date) : new Date(),
        bookshopId: resolvedId,
      },
    });
  }

  async findAll(bookshopId?: string | null, startDate?: string, endDate?: string) {
    const resolvedId = await this.resolveBookshopId(bookshopId);

    const where: any = resolvedId ? { bookshopId: resolvedId } : {};

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

  async update(id: string, dto: UpdateExpenseDto, bookshopId?: string | null) {
    const resolvedId = await this.resolveBookshopId(bookshopId);
    const expense = await this.prisma.expense.findFirst({
      where: { id, ...(resolvedId ? { bookshopId: resolvedId } : {}) },
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

  async remove(id: string, bookshopId?: string | null) {
    const resolvedId = await this.resolveBookshopId(bookshopId);
    const expense = await this.prisma.expense.findFirst({
      where: { id, ...(resolvedId ? { bookshopId: resolvedId } : {}) },
    });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return this.prisma.expense.delete({
      where: { id },
    });
  }
}
