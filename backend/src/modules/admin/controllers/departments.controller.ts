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
import { DepartmentsService } from '../services/departments.service';
import {
  CreateDepartmentDto,
  UpdateDepartmentDto,
} from '../dto/department.dto';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';

@ApiTags('admin')
@UseInterceptors(AuditLogInterceptor)
@Controller('admin/departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  // Reference/lookup data (a university has a few dozen departments at
  // most, not thousands) — always return the full list rather than
  // CrudService.findAll's default page size of 20, which would silently
  // truncate the SignUp/admin department pickers.
  @Public()
  @Get()
  findAll(@Query('bookshopId') bookshopId?: string) {
    return this.departmentsService.findAll(1, 200, bookshopId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @AuditAction('department.create')
  @Post()
  create(
    @Body() dto: CreateDepartmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.departmentsService.create(dto, user.bookshopId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @AuditAction('department.update')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateDepartmentDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.departmentsService.update(id, dto, user.bookshopId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @AuditAction('department.delete')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.departmentsService.remove(id, user.bookshopId);
  }
}
