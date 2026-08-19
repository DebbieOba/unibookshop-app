import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { CategoriesService } from '../services/categories.service';
import { CreateCategoryDto } from '../dto/create-category.dto';
import { CurrentUser, type CurrentUserPayload } from '../../../common/decorators/current-user.decorator';

@ApiTags('catalogue')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Public()
  @Get()
  findAll(@Query('bookshopId') bookshopId?: string) {
    return this.categoriesService.findAll(bookshopId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Post()
  create(@Body() dto: CreateCategoryDto, @CurrentUser() user: CurrentUserPayload) {
    return this.categoriesService.create(dto, user.bookshopId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.categoriesService.remove(id, user.bookshopId);
  }
}
