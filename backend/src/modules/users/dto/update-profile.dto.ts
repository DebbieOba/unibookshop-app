import { IsOptional, IsString, IsUUID, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { MATRIC_NUMBER_MESSAGE, MATRIC_NUMBER_REGEX } from '../../../common/validators/matric-number.validator';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsString({ each: true })
  interests?: string[];

  // Department is set at registration; levelId isn't collected until
  // Preferences (screen 7) — both live on User, not Profile, so they're
  // updated alongside the Profile fields in UsersService.updateProfile.
  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  levelId?: string;

  // Also lives on User, not Profile — unique across every account (schema.prisma's
  // User.matricNumber @unique). UsersService.updateProfile surfaces a
  // ConflictException if another account already has it.
  @ApiPropertyOptional({ example: 'EEE/34/1234' })
  @IsOptional()
  @IsString()
  @Matches(MATRIC_NUMBER_REGEX, { message: MATRIC_NUMBER_MESSAGE })
  matricNumber?: string;
}
