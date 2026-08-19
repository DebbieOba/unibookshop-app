import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { AuditAction, AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';
import { LevelsService } from '../services/levels.service';
import { CreateLevelDto, UpdateLevelDto } from '../dto/level.dto';
import { CurrentUser, type CurrentUserPayload } from '../../../common/decorators/current-user.decorator';

@ApiTags('admin')
@UseInterceptors(AuditLogInterceptor)
@Controller('admin/levels')
export class LevelsController {
  constructor(private readonly levelsService: LevelsService) {}

  @Public()
  @Get()
  findAll(@Query('bookshopId') bookshopId?: string) {
    return this.levelsService.findAll(1, 200, bookshopId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @AuditAction('level.create')
  @Post()
  create(@Body() dto: CreateLevelDto, @CurrentUser() user: CurrentUserPayload) {
    return this.levelsService.create(dto, user.bookshopId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @AuditAction('level.update')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateLevelDto, @CurrentUser() user: CurrentUserPayload) {
    return this.levelsService.update(id, dto, user.bookshopId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @AuditAction('level.delete')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.levelsService.remove(id, user.bookshopId);
  }
}
