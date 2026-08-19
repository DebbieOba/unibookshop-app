import { Type } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaginationDto } from '../../../common/dto/pagination.dto';

const CONDITIONS = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'] as const;

export class BrowseListingsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Matches title, author or course code' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: CONDITIONS })
  @IsOptional()
  @IsIn(CONDITIONS)
  condition?: (typeof CONDITIONS)[number];

  @ApiPropertyOptional({
    default: false,
    description: 'Only the current user’s own listings (any status)',
  })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  mine?: boolean;
}
