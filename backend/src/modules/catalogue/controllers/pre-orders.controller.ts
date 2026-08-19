import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { PreOrdersService } from '../services/pre-orders.service';
import { ReservePreOrderDto } from '../dto/reserve-pre-order.dto';

// Real reservation flow behind the Store screen's "Pre-Order Syllabus"
// banner — reserving costs nothing up front; reservers get notified the
// moment an admin flips the book off isPreOrder (see BooksService.update's
// notifyPreOrderReservers).
@ApiTags('catalogue')
@ApiBearerAuth()
@Controller('pre-orders')
export class PreOrdersController {
  constructor(private readonly preOrdersService: PreOrdersService) {}

  @Get()
  findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.preOrdersService.findMine(user.id);
  }

  @Post()
  reserve(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: ReservePreOrderDto,
  ) {
    return this.preOrdersService.reserve(user.id, dto.bookId);
  }

  @Delete(':bookId')
  cancel(
    @CurrentUser() user: CurrentUserPayload,
    @Param('bookId') bookId: string,
  ) {
    return this.preOrdersService.cancel(user.id, bookId);
  }
}
