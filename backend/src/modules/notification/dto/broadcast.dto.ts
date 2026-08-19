import { IsIn, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class BroadcastDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  body!: string;

  @ApiPropertyOptional({ enum: ['student', 'admin', 'all'], default: 'student' })
  @IsOptional()
  @IsIn(['student', 'admin', 'all'])
  audience?: 'student' | 'admin' | 'all';
}
