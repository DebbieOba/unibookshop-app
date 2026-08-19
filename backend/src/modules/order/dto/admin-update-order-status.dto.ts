import { IsIn, IsNotEmpty, IsString, ValidateIf } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminUpdateOrderStatusDto {
  @ApiProperty({ enum: ['CANCELLED', 'COMPLETED'] })
  @IsIn(['CANCELLED', 'COMPLETED'])
  status!: 'CANCELLED' | 'COMPLETED';

  @ApiPropertyOptional({ description: 'Required when cancelling' })
  @ValidateIf((o: AdminUpdateOrderStatusDto) => o.status === 'CANCELLED')
  @IsString()
  @IsNotEmpty()
  reason?: string;
}
