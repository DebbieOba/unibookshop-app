import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { CrudService } from '../../../common/crud.service';
import { CreatePromoCodeDto, UpdatePromoCodeDto } from '../dto/promo-code.dto';

export interface PromoValidationResult {
  id: string;
  code: string;
  discountAmount: number;
}

@Injectable()
export class PromoCodesService extends CrudService<
  any,
  CreatePromoCodeDto,
  UpdatePromoCodeDto
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.promoCode);
  }

  override create(dto: CreatePromoCodeDto, bookshopId?: string | null) {
    return this.prisma.promoCode.create({
      data: {
        ...dto,
        code: dto.code.toUpperCase(),
        ...(bookshopId && { bookshopId }),
      },
    });
  }

  /** Re-validates server-side at cart-apply time AND again at checkout — never trust a client-supplied discount. */
  async validate(
    code: string,
    subtotal: number,
  ): Promise<PromoValidationResult> {
    const promo = await this.prisma.promoCode.findUnique({
      where: { code: code.trim().toUpperCase() },
    });
    if (!promo || !promo.active) {
      throw new BadRequestException('Invalid promo code');
    }
    if (promo.expiresAt && promo.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('This promo code has expired');
    }
    if (promo.usageLimit !== null && promo.timesRedeemed >= promo.usageLimit) {
      throw new BadRequestException(
        'This promo code has reached its usage limit',
      );
    }
    const minSubtotal = promo.minSubtotal ? Number(promo.minSubtotal) : 0;
    if (subtotal < minSubtotal) {
      throw new BadRequestException(
        `This promo code requires a minimum subtotal of ₦${minSubtotal.toLocaleString()}`,
      );
    }

    let discount =
      promo.type === 'PERCENT'
        ? (subtotal * Number(promo.value)) / 100
        : Number(promo.value);
    if (promo.maxDiscount !== null)
      discount = Math.min(discount, Number(promo.maxDiscount));
    discount = Math.min(Math.round(discount), subtotal);

    return { id: promo.id, code: promo.code, discountAmount: discount };
  }

  async redeem(id: string) {
    await this.prisma.promoCode.update({
      where: { id },
      data: { timesRedeemed: { increment: 1 } },
    });
  }
}
