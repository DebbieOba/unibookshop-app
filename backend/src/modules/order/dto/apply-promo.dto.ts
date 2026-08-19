import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ApplyPromoDto {
  @ApiProperty()
  @IsString()
  code!: string;
}
