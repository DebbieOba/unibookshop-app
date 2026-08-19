import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReservePreOrderDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  bookId!: string;
}
