import { IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDepartmentDto {
  @ApiProperty()
  @IsString()
  name!: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  schoolId!: string;
}

export class UpdateDepartmentDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;
}
