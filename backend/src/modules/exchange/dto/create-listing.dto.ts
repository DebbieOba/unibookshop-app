import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

const CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'] as const;
export type ListingConditionValue = (typeof CONDITIONS)[number];

export class CreateListingDto {
  @ApiProperty()
  @IsString()
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({
    description:
      'e.g. "CSC 301" — helps buyers searching for their course books',
  })
  @IsOptional()
  @IsString()
  courseCode?: string;

  @ApiProperty({ enum: CONDITIONS })
  @IsIn(CONDITIONS)
  condition!: ListingConditionValue;

  @ApiProperty({ minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;
}
