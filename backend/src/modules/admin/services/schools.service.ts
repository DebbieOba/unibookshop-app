import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { CrudService } from '../../../common/crud.service';
import { CreateSchoolDto, UpdateSchoolDto } from '../dto/school.dto';

@Injectable()
export class SchoolsService extends CrudService<any, CreateSchoolDto, UpdateSchoolDto> {
  constructor(prisma: PrismaService) {
    super(prisma.school);
  }
}
