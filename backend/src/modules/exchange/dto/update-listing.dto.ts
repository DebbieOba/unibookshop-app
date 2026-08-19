import { PartialType } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CreateListingDto } from './create-listing.dto';

const STATUSES = ['AVAILABLE', 'SOLD', 'REMOVED'] as const;

export class UpdateListingDto extends PartialType(CreateListingDto) {
  @ApiPropertyOptional({ enum: STATUSES })
  @IsOptional()
  @IsIn(STATUSES)
  status?: (typeof STATUSES)[number];
}
