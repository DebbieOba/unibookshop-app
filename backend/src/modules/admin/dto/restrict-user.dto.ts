import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RestrictUserDto {
  @ApiProperty({ description: 'Why this account is being restricted' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
