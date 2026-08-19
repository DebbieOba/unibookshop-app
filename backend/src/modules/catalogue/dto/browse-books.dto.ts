import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

export class BrowseBooksDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Matches title or author' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  categoryId?: string;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  inStockOnly?: boolean;

  @ApiPropertyOptional({ default: false, description: 'Only books where compareAtPrice > price' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  onSale?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPreOrder?: boolean;

  @ApiPropertyOptional({ description: 'Exact course code match, e.g. "CSC 301"' })
  @IsOptional()
  @IsString()
  courseCode?: string;

  @ApiPropertyOptional({ enum: ['newest', 'priceAsc', 'priceDesc'] })
  @IsOptional()
  @IsIn(['newest', 'priceAsc', 'priceDesc'])
  sort?: 'newest' | 'priceAsc' | 'priceDesc';

  @ApiPropertyOptional({ format: 'uuid' })
  @IsOptional()
  @IsUUID()
  bookshopId?: string;
}
