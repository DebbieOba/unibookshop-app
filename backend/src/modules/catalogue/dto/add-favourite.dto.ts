import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddFavouriteDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  bookId!: string;
}
