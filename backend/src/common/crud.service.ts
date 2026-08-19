import { BadRequestException } from '@nestjs/common';

interface PrismaDelegate<T> {
  findMany(args?: any): Promise<T[]>;
  count(args?: any): Promise<number>;
  findUnique(args: any): Promise<T | null>;
  create(args: any): Promise<T>;
  update(args: any): Promise<T>;
  delete(args: any): Promise<T>;
}

/**
 * Generic CRUD base for simple, near-identical admin resources
 * (Schools/Departments/Levels — see backend-architecture.md §2).
 * Resources with real business logic (e.g. Books) should not extend this.
 */
export abstract class CrudService<T, CreateDto, UpdateDto> {
  protected constructor(protected readonly delegate: PrismaDelegate<T>) {}

  async findAll(page = 1, limit = 20, bookshopId?: string) {
    const where = bookshopId ? { bookshopId } : undefined;
    const [data, total] = await Promise.all([
      this.delegate.findMany({ where, skip: (page - 1) * limit, take: limit }),
      this.delegate.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  findOne(id: string) {
    return this.delegate.findUnique({ where: { id } });
  }

  create(dto: CreateDto, bookshopId?: string | null) {
    return this.delegate.create({
      data: {
        ...dto,
        ...(bookshopId && { bookshopId }),
      },
    });
  }

  async update(id: string, dto: UpdateDto, bookshopId?: string | null) {
    if (bookshopId) {
      const existing: any = await this.findOne(id);
      if (existing && existing.bookshopId && existing.bookshopId !== bookshopId) {
        throw new BadRequestException('You do not have access to this resource');
      }
    }
    return this.delegate.update({ where: { id }, data: dto });
  }

  async remove(id: string, bookshopId?: string | null) {
    if (bookshopId) {
      const existing: any = await this.findOne(id);
      if (existing && existing.bookshopId && existing.bookshopId !== bookshopId) {
        throw new BadRequestException('You do not have access to this resource');
      }
    }
    return this.delegate.delete({ where: { id } });
  }
}
