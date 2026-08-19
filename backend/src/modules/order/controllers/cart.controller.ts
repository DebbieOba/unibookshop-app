import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { CartService } from '../services/cart.service';
import { CartItemDto } from '../dto/cart-item.dto';
import { ApplyPromoDto } from '../dto/apply-promo.dto';

@ApiTags('order')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  get(@CurrentUser() user: CurrentUserPayload) {
    return this.cartService.get(user.id);
  }

  @Post()
  setLine(@CurrentUser() user: CurrentUserPayload, @Body() dto: CartItemDto) {
    return this.cartService.setLine(user.id, dto.bookId, dto.quantity);
  }

  @Delete(':bookId')
  removeLine(
    @CurrentUser() user: CurrentUserPayload,
    @Param('bookId') bookId: string,
  ) {
    return this.cartService.removeLine(user.id, bookId);
  }

  @Delete()
  clear(@CurrentUser() user: CurrentUserPayload) {
    return this.cartService.clear(user.id);
  }

  @Post('promo')
  applyPromo(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ApplyPromoDto,
  ) {
    return this.cartService.applyPromo(user.id, dto.code);
  }

  @Delete('promo')
  removePromo(@CurrentUser() user: CurrentUserPayload) {
    return this.cartService.removePromo(user.id);
  }
}
