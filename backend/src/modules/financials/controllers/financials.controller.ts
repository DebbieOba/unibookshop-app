import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FinancialsService } from '../services/financials.service';
import { JwtAuthGuard } from '../../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { Roles } from '../../../common/decorators/roles.decorator';
import { CurrentUser, type CurrentUserPayload } from '../../../common/decorators/current-user.decorator';

@ApiTags('Financials')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('seller')
@Controller('seller/financials')
export class FinancialsController {
  constructor(private readonly financialsService: FinancialsService) {}

  @Get('dashboard')
  getDashboardData(
    @CurrentUser() user: CurrentUserPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialsService.getDashboardData(
      user.bookshopId,
      startDate,
      endDate,
    );
  }

  @Get('transactions')
  getTransactions(
    @CurrentUser() user: CurrentUserPayload,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.financialsService.getTransactions(
      user.bookshopId,
      startDate,
      endDate,
    );
  }

  @Get('inventory-value')
  getInventoryValue(@CurrentUser() user: CurrentUserPayload) {
    return this.financialsService.getInventoryValue(user.bookshopId);
  }
}
