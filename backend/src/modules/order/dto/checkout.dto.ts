import { IsIn, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CheckoutDto {
  @ApiProperty({ enum: ['PICKUP', 'DELIVERY'] })
  @IsIn(['PICKUP', 'DELIVERY'])
  deliveryMethod!: 'PICKUP' | 'DELIVERY';

  @ApiPropertyOptional({ format: 'uuid', description: 'Required when deliveryMethod is DELIVERY' })
  @IsOptional()
  @IsUUID()
  addressId?: string;

  @ApiProperty({ enum: ['PAYSTACK', 'FLUTTERWAVE'] })
  @IsIn(['PAYSTACK', 'FLUTTERWAVE'])
  paymentProvider!: 'PAYSTACK' | 'FLUTTERWAVE';
}
