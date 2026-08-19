import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import {
  AuditAction,
  AuditLogInterceptor,
} from '../../../common/interceptors/audit-log.interceptor';
import { SchoolsService } from '../services/schools.service';
import { CreateSchoolDto, UpdateSchoolDto } from '../dto/school.dto';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';

// GET is public — Registration (screen 4) and Preferences (screen 7) need this
// dropdown data before/without an approved session. Mutations are admin-only.
@ApiTags('admin')
@UseInterceptors(AuditLogInterceptor)
@Controller('admin/schools')
export class SchoolsController {
  constructor(private readonly schoolsService: SchoolsService) {}

  @Public()
  @Get()
  findAll(@Query('bookshopId') bookshopId?: string) {
    return this.schoolsService.findAll(1, 200, bookshopId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @AuditAction('school.create')
  @Post()
  create(
    @Body() dto: CreateSchoolDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.schoolsService.create(dto, user.bookshopId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @AuditAction('school.update')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSchoolDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.schoolsService.update(id, dto, user.bookshopId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @AuditAction('school.delete')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.schoolsService.remove(id, user.bookshopId);
  }
}
