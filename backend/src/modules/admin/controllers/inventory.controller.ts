import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
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
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { StockService } from '../../catalogue/catalogue.public-api';
import { InventoryService } from '../services/inventory.service';
import { AdjustInventoryDto } from '../dto/adjust-inventory.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('seller')
@UseInterceptors(AuditLogInterceptor)
@Controller('seller/inventory')
export class InventoryController {
  constructor(
    private readonly inventoryService: InventoryService,
    private readonly stockService: StockService,
  ) {}

  @Get()
  getSummary(@CurrentUser() user: CurrentUserPayload) {
    return this.inventoryService.getSummary(user.bookshopId);
  }

  @AuditAction('inventory.adjust')
  @Patch(':id/adjust')
  adjust(
    @Param('id') id: string,
    @Body() dto: AdjustInventoryDto,
    @CurrentUser() admin: CurrentUserPayload,
  ) {
    return this.stockService.adjustStock(id, dto, admin.id);
  }
}
