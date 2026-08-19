import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SetPushTokenDto {
  @ApiProperty({ description: 'FCM device push token' })
  @IsString()
  token!: string;
}
