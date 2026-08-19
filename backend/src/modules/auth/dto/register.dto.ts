import { IsEmail, IsOptional, IsString, IsUUID, Matches, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { MATRIC_NUMBER_MESSAGE, MATRIC_NUMBER_REGEX } from '../../../common/validators/matric-number.validator';

export class RegisterDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ example: 'EEE/34/1234' })
  @IsOptional()
  @IsString()
  @Matches(MATRIC_NUMBER_REGEX, { message: MATRIC_NUMBER_MESSAGE })
  matricNumber?: string;

  // Collected post-signup on CompleteProfileScreen instead — see
  // frontend-architecture.md's auth flow notes.
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  bookshopId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  bookshopName?: string;

  @ApiPropertyOptional({ example: 'student' })
  @IsOptional()
  @IsString()
  role?: string;
}
