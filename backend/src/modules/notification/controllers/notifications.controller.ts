import {
  Body,
  Controller,
  Get,
  Post,
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
import { PrismaService } from '../../../database/postgres/prisma.service';
import { NotifyService } from '../services/notify.service';
import { BroadcastDto } from '../dto/broadcast.dto';

@ApiTags('notification')
@ApiBearerAuth()
@UseInterceptors(AuditLogInterceptor)
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notifyService: NotifyService,
  ) {}

  @Get()
  findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.prisma.notificationRecipient.findMany({
      where: { userId: user.id },
      include: { notification: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  @Post('mark-all-read')
  markAllRead(@CurrentUser() user: CurrentUserPayload) {
    return this.prisma.notificationRecipient.updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    });
  }

  @UseGuards(RolesGuard)
  @Roles('admin')
  @AuditAction('notification.broadcast')
  @Post('broadcast')
  broadcast(@Body() dto: BroadcastDto) {
    return this.notifyService.broadcast(
      { title: dto.title, body: dto.body, type: 'BROADCAST' },
      dto.audience ?? 'student',
    );
  }
}
