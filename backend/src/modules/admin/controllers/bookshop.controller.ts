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
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { BookshopService } from '../services/bookshop.service';
import type { UpdateBookshopDto } from '../services/bookshop.service';
import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';

@ApiTags('admin')
@Controller('bookshop')
export class BookshopController {
  constructor(private readonly bookshopService: BookshopService) {}

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
    if (user.role !== 'superadmin' && user.bookshopId !== id) {
      throw new ForbiddenException('You can only update your own bookstore');
    }
    return this.bookshopService.update(id, dto);
  }
}
