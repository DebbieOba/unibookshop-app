import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { AuditAction, AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';
import { OrdersService } from '../services/orders.service';
import { CheckoutService } from '../services/checkout.service';
import { InsightsService } from '../services/insights.service';
import { CheckoutDto } from '../dto/checkout.dto';
import { AdminUpdateOrderStatusDto } from '../dto/admin-update-order-status.dto';

@ApiTags('order')
@ApiBearerAuth()
@UseInterceptors(AuditLogInterceptor)
@Controller()
export class OrdersController {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly checkoutService: CheckoutService,
    private readonly insightsService: InsightsService,
  ) {}

  @Post('checkout')
  checkout(@CurrentUser() user: CurrentUserPayload, @Body() dto: CheckoutDto) {
    return this.checkoutService.checkout(user, dto);
  }

  @Get('orders')
  findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.findMine(user.id);
  }

  @Get('orders/savings-summary')
  getSavingsSummary(@CurrentUser() user: CurrentUserPayload) {
    return this.insightsService.getSavingsSummary(user.id);
  }

  @Get('orders/syllabus-progress')
  getSyllabusProgress(@CurrentUser() user: CurrentUserPayload) {
    return this.insightsService.getSyllabusProgress(user.id);
  }

  @Get('orders/:id')
  findOne(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.findOne(id, user);
  }

  /**
   * Actively asks the payment provider for the transaction status instead of
   * waiting on its webhook — called by the mobile app right when the
   * checkout WebView detects the payment-callback redirect, so the order
   * resolves immediately instead of depending on webhook delivery (which,
   * for a LAN-only dev backend, can never arrive at all).
   */
  @Post('orders/:id/verify-payment')
  verifyPayment(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.checkoutService.verifyPayment(id, user);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('admin/orders')
  findAllForAdmin(
    @Query('status') status: 'PROCESSING' | 'COMPLETED' | 'CANCELLED' | undefined,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.ordersService.findAllForAdmin(status, user.bookshopId);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @Get('admin/orders/:id')
  findOneForAdmin(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.ordersService.findOne(id, user);
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @AuditAction('order.status-update')
  @Patch('admin/orders/:id/status')
  async updateStatusForAdmin(
    @Param('id') id: string,
    @Body() dto: AdminUpdateOrderStatusDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    await this.ordersService.findOne(id, user);
    return this.checkoutService.adminUpdateStatus(id, dto.status, dto.reason);
  }
}
