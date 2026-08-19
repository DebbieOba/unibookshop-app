import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { CrudService } from '../../../common/crud.service';
import { CreateDepartmentDto, UpdateDepartmentDto } from '../dto/department.dto';

@Injectable()
export class DepartmentsService extends CrudService<any, CreateDepartmentDto, UpdateDepartmentDto> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.department);
  }

  override async findAll(page = 1, limit = 20, bookshopId?: string) {
    const where = bookshopId ? { school: { bookshopId } } : undefined;
    const [data, total] = await Promise.all([
      this.prisma.department.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: { school: true },
      }),
      this.prisma.department.count({ where }),
    ]);
    return { data, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
  }

  override async create(dto: CreateDepartmentDto, bookshopId?: string | null) {
    if (bookshopId) {
      const school = await this.prisma.school.findUnique({ where: { id: dto.schoolId } });
      if (!school || (school.bookshopId && school.bookshopId !== bookshopId)) {
        throw new BadRequestException('Invalid school selection');
      }
    }
    return this.prisma.department.create({ data: dto });
  }
}
