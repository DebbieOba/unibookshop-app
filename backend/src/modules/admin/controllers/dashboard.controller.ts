import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { DashboardService } from '../services/dashboard.service';
import { CurrentUser, type CurrentUserPayload } from '../../../common/decorators/current-user.decorator';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('admin')
@Controller('admin/dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  getKpis(@CurrentUser() user: CurrentUserPayload) {
    return this.dashboardService.getKpis(user.bookshopId);
  }

  @Get('profit-loss')
  getProfitLoss(@Query('range') range: string, @CurrentUser() user: CurrentUserPayload) {
    if (!user.bookshopId) {
      throw new Error('User has no bookshop associated');
    }
    return this.dashboardService.getProfitLoss(user.bookshopId, range);
  }
}
