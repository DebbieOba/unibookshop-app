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
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import {
  AuditAction,
  AuditLogInterceptor,
} from '../../../common/interceptors/audit-log.interceptor';
import { PromoCodesService } from '../services/promo-codes.service';
import { CreatePromoCodeDto, UpdatePromoCodeDto } from '../dto/promo-code.dto';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';

// Admin-only end to end — unlike Schools/Departments/Levels, promo codes have
// no public-facing "browse" use case; students only ever reach one via
// POST /cart/promo (see PromotionsModule's public API + OrderModule).
@ApiTags('promotions')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('admin')
@UseInterceptors(AuditLogInterceptor)
@Controller('admin/promo-codes')
export class PromoCodesController {
  constructor(private readonly promoCodesService: PromoCodesService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @CurrentUser() user?: CurrentUserPayload,
  ) {
    return this.promoCodesService.findAll(
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
      user?.bookshopId || undefined,
    );
  }

  @AuditAction('promo-code.create')
  @Post()
  create(
    @Body() dto: CreatePromoCodeDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.promoCodesService.create(dto, user.bookshopId);
  }

  @AuditAction('promo-code.update')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdatePromoCodeDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.promoCodesService.update(id, dto, user.bookshopId);
  }

  @AuditAction('promo-code.delete')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.promoCodesService.remove(id, user.bookshopId);
  }
}
