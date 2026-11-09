import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ enum: ['verify-email', 'sign-in'] })
  @IsEnum(['verify-email', 'sign-in'])
  purpose: 'verify-email' | 'sign-in';
}

export class VerifyOtpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(6)
  code: string;

  @ApiProperty({ enum: ['verify-email', 'sign-in'] })
  @IsEnum(['verify-email', 'sign-in'])
  purpose: 'verify-email' | 'sign-in';
}
