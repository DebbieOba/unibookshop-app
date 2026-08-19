import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';
import { RatingsService } from '../services/ratings.service';
import { RateBookDto } from '../dto/rate-book.dto';

@ApiTags('catalogue')
@Controller('books/:bookId/ratings')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Public()
  @Get()
  findForBook(@Param('bookId') bookId: string) {
    return this.ratingsService.findForBook(bookId);
  }

  @ApiBearerAuth()
  @Post()
  rate(
    @Param('bookId') bookId: string,
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: RateBookDto,
  ) {
    return this.ratingsService.rate(bookId, user.id, dto.score, dto.comment);
  }
}
