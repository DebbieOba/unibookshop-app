import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import {
  BookshopService,
  UpdateBookshopDto,
} from '../services/bookshop.service';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';

@ApiTags('admin')
@Controller('bookshop')
export class BookshopController {
  constructor(private readonly bookshopService: BookshopService) {}

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('seller', 'superadmin')
  @Get('me')
  findMine(@CurrentUser() user: CurrentUserPayload) {
    return this.bookshopService.resolveBookshopForSeller(
      user.id,
      user.bookshopId,
    );
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('seller', 'superadmin')
  @Patch('me')
  async updateMine(
    @Body() dto: UpdateBookshopDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    const bookshop = await this.bookshopService.resolveBookshopForSeller(
      user.id,
      user.bookshopId,
    );
    return this.bookshopService.update(bookshop.id, dto);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookshopService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('seller', 'superadmin')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBookshopDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    if (
      user.role !== 'superadmin' &&
      user.bookshopId &&
      user.bookshopId !== id
    ) {
      throw new ForbiddenException('You can only update your own bookstore');
    }
    return this.bookshopService.update(id, dto);
  }
}
