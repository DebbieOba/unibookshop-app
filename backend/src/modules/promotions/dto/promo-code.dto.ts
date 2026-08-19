import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsIn, IsInt, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePromoCodeDto {
  @ApiProperty({ description: 'Case-insensitive; stored uppercased' })
  @IsString()
  code!: string;

  @ApiProperty({ enum: ['PERCENT', 'FIXED'] })
  @IsIn(['PERCENT', 'FIXED'])
  type!: 'PERCENT' | 'FIXED';

  @ApiProperty({ minimum: 0, description: 'Percent (0-100) or a fixed naira amount, depending on type' })
  @IsNumber()
  @Min(0)
  value!: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minSubtotal?: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Caps the discount amount — mainly useful for PERCENT codes' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;
}

export class UpdatePromoCodeDto {
  @ApiPropertyOptional({ enum: ['PERCENT', 'FIXED'] })
  @IsOptional()
  @IsIn(['PERCENT', 'FIXED'])
  type?: 'PERCENT' | 'FIXED';

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  value?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minSubtotal?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxDiscount?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiPropertyOptional({ minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  usageLimit?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  active?: boolean;
}

export class ApplyPromoCodeDto {
  @ApiProperty()
  @IsString()
  code!: string;
}
