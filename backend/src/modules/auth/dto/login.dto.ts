import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * Documents `POST /auth/login`'s body for Swagger only — Passport's
 * LocalStrategy reads the request body directly (no `@Body()` binding in
 * the controller), so this class is never imported for validation.
 */
export class LoginDto {
  @ApiProperty({ description: 'Email address' })
  @IsString()
  identifier!: string;

  @ApiProperty({ minLength: 8 })
  @IsString()
  @MinLength(8)
  password!: string;
}
