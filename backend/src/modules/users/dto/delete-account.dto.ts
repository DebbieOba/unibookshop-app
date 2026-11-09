import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DeleteAccountDto {
  @ApiProperty({ description: 'Current account password to confirm deletion identity' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}

