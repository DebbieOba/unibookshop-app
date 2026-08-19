import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateLevelDto {
  @ApiProperty()
  @IsString()
  name!: string;
}

export class UpdateLevelDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}
