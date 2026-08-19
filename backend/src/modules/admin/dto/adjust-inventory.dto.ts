import { IsIn, IsInt, IsNotEmpty, IsString, NotEquals } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { InventoryMovementType } from '../../catalogue/catalogue.public-api';

const MOVEMENT_TYPES: InventoryMovementType[] = [
  'RESTOCK',
  'DAMAGE',
  'CORRECTION',
  'RETURN',
  'MANUAL_REDUCTION',
];

export class AdjustInventoryDto {
  @ApiProperty({ enum: MOVEMENT_TYPES })
  @IsIn(MOVEMENT_TYPES)
  type!: InventoryMovementType;

  @ApiProperty({ description: 'Signed change to apply — positive to increase, negative to decrease' })
  @IsInt()
  @NotEquals(0)
  quantityDelta!: number;

  @ApiProperty({ description: 'Why this adjustment is being made' })
  @IsString()
  @IsNotEmpty()
  reason!: string;
}
