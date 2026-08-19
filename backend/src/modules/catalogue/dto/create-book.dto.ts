import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateBookDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiProperty()
  @IsString()
  author!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ minimum: 0 })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Wholesale/acquisition cost of the book. Defaults to 0.' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Undiscounted reference price. Must be > price for the book to be treated as "on sale".' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiPropertyOptional({ description: 'e.g. "CSC 301" — course this book is required reading for' })
  @IsOptional()
  @IsString()
  courseCode?: string;

  @ApiPropertyOptional({ description: 'e.g. "Software Engineering"' })
  @IsOptional()
  @IsString()
  courseTitle?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPreOrder?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiPropertyOptional({ description: 'Set via POST /books/:id/cover instead, normally' })
  @IsOptional()
  @IsString()
  coverUrl?: string;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  stockQuantity!: number;

  @ApiPropertyOptional({ minimum: 0, description: 'Per-book override of the admin dashboard\'s global low-stock threshold' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  reorderThreshold?: number;
}
