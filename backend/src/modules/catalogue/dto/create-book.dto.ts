import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum BookConditionDto {
  NEW = 'NEW',
  LIKE_NEW = 'LIKE_NEW',
  GOOD = 'GOOD',
  FAIR = 'FAIR',
  POOR = 'POOR',
}

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

  @ApiPropertyOptional({
    minimum: 0,
    description: 'Wholesale/acquisition cost of the book. Defaults to 0.',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  costPrice?: number;

  @ApiPropertyOptional({
    minimum: 0,
    description:
      'Undiscounted reference price. Must be > price for the book to be treated as "on sale".',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  compareAtPrice?: number;

  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  categoryId!: string;

  @ApiPropertyOptional({
    format: 'uuid',
    description: 'Sub-classification within the category',
  })
  @IsOptional()
  @IsUUID()
  subcategoryId?: string;

  @ApiPropertyOptional({
    description: 'e.g. "Undergraduate", "General Readers", "Children"',
  })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiProperty({ minimum: 0 })
  @IsInt()
  @Min(0)
  stockQuantity!: number;

  @ApiPropertyOptional({
    minimum: 0,
    description:
      "Per-book override of the admin dashboard's global low-stock threshold",
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  reorderThreshold?: number;

  @ApiPropertyOptional({ enum: BookConditionDto, default: 'NEW' })
  @IsOptional()
  @IsEnum(BookConditionDto)
  bookCondition?: BookConditionDto;

  // --- Bibliographic fields ---

  @ApiPropertyOptional({ description: 'ISBN-10 or ISBN-13' })
  @IsOptional()
  @IsString()
  isbn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  publisher?: string;

  @ApiPropertyOptional({ description: 'e.g. "3rd Edition"' })
  @IsOptional()
  @IsString()
  edition?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  publicationYear?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  numberOfPages?: number;

  @ApiPropertyOptional({ default: 'English' })
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional({
    description: 'Full text or outline of table of contents',
  })
  @IsOptional()
  @IsString()
  tableOfContents?: string;

  @ApiPropertyOptional({
    description: 'Notes on book structure, chapters, appendices',
  })
  @IsOptional()
  @IsString()
  bookAnatomy?: string;

  @ApiPropertyOptional({
    description: 'Array of image URLs for page previews',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  previewPages?: string[];

  @ApiPropertyOptional({
    description: 'Searchable tags for the book',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  // --- Legacy fields (kept for backward-compat) ---

  @ApiPropertyOptional({
    description: 'e.g. "CSC 301" — course this book is required reading for',
  })
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

  @ApiPropertyOptional({
    description: 'Set via POST /books/:id/cover instead, normally',
  })
  @IsOptional()
  @IsString()
  coverUrl?: string;
}
