import { Body, Controller, Get, Param, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { IsIn } from 'class-validator';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { AuditAction, AuditLogInterceptor } from '../../../common/interceptors/audit-log.interceptor';
import { ApprovalsService } from '../services/approvals.service';
import { RestrictUserDto } from '../dto/restrict-user.dto';

class DecideApprovalDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED'] })
  @IsIn(['APPROVED', 'REJECTED'])
  decision!: 'APPROVED' | 'REJECTED';
}

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('admin')
@UseInterceptors(AuditLogInterceptor)
@Controller('admin/approvals')
export class ApprovalsController {
  constructor(private readonly approvalsService: ApprovalsService) {}

  @Get()
  findPending() {
    return this.approvalsService.findPending();
  }

  /** Approved + restricted users — the "Active" side of Users & Access. */
  @Get('active')
  findActive() {
    return this.approvalsService.findActive();
  }

  @AuditAction('user.approval-decide')
  @Post(':id/decide')
  decide(@Param('id') id: string, @Body() dto: DecideApprovalDto) {
    return this.approvalsService.decide(id, dto.decision);
  }

  @AuditAction('user.restrict')
  @Post(':id/restrict')
  restrict(@Param('id') id: string, @Body() dto: RestrictUserDto) {
    return this.approvalsService.restrict(id, dto.reason);
  }

  @AuditAction('user.restore')
  @Post(':id/restore')
  restore(@Param('id') id: string) {
    return this.approvalsService.restore(id);
  }
}
