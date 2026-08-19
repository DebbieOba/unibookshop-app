import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { CrudService } from '../../../common/crud.service';
import { CreateLevelDto, UpdateLevelDto } from '../dto/level.dto';

@Injectable()
export class LevelsService extends CrudService<any, CreateLevelDto, UpdateLevelDto> {
  constructor(prisma: PrismaService) {
    super(prisma.level);
  }
}
