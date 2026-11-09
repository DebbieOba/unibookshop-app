import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BroadcastDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  body!: string;

  @ApiPropertyOptional({
    enum: ['customer', 'seller', 'all'],
    default: 'customer',
  })
  @IsOptional()
  @IsIn(['customer', 'seller', 'all'])
  audience?: 'customer' | 'seller' | 'all';
}
