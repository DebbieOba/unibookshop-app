import {
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

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
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fullName?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  bookshopId?: string;

  @ApiPropertyOptional({
    description: 'Name of a new bookstore to create (seller signup)',
  })
  @IsOptional()
  @IsString()
  bookshopName?: string;

  /** 'seller' creates a new bookstore; 'customer' joins an existing one. */
  @ApiPropertyOptional({ enum: ['customer', 'seller'], example: 'customer' })
  @IsOptional()
  @IsIn(['customer', 'seller'])
  role?: 'customer' | 'seller';
}
