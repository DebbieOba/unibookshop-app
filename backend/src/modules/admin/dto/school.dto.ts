import { IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSchoolDto {
  @ApiProperty()
  @IsString()
  name!: string;
}

export class UpdateSchoolDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}
