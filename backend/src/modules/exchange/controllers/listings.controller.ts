import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { CurrentUser, type CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { ListingsService } from '../services/listings.service';
import { BrowseListingsDto } from '../dto/browse-listings.dto';
import { CreateListingDto } from '../dto/create-listing.dto';
import { UpdateListingDto } from '../dto/update-listing.dto';

// Contact-only listing board: a seller lists a used textbook, a buyer sees the
// seller's name/phone on the detail screen and arranges the exchange
// themselves — no cart/checkout/payment integration (see implementation-plan.md).
@ApiTags('exchange')
@ApiBearerAuth()
@Controller('exchange/listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  findAll(@Query() query: BrowseListingsDto, @CurrentUser() user: CurrentUserPayload) {
    return this.listingsService.findAll(query, user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @ApiConsumes('multipart/form-data')
  @Post()
  @UseInterceptors(FilesInterceptor('images', 3))
  create(
    @CurrentUser() user: CurrentUserPayload,
    @Body() dto: CreateListingDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.listingsService.create(user, dto, files ?? []);
  }

  @Patch(':id')
  update(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload, @Body() dto: UpdateListingDto) {
    return this.listingsService.update(id, user, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.listingsService.remove(id, user);
  }
}
