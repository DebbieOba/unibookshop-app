import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { FavouritesService } from '../services/favourites.service';
import { AddFavouriteDto } from '../dto/add-favourite.dto';

@ApiTags('catalogue')
@ApiBearerAuth()
@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Get()
  findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.favouritesService.findMine(user.id);
  }

  @Post()
  add(@CurrentUser() user: CurrentUserPayload, @Body() dto: AddFavouriteDto) {
    return this.favouritesService.add(user.id, dto.bookId);
  }

  @Delete(':bookId')
  remove(@CurrentUser() user: CurrentUserPayload, @Param('bookId') bookId: string) {
    return this.favouritesService.remove(user.id, bookId);
  }
}
