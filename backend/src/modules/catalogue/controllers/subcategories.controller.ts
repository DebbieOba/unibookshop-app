import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SubcategoriesService } from '../services/subcategories.service';
import { Roles } from '../../../common/decorators/roles.decorator';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('catalogue')
@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    return this.subcategoriesService.findAll(categoryId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subcategoriesService.findOne(id);
  }

  @Roles('superadmin', 'seller')
  @Post()
  create(@Body('categoryId') categoryId: string, @Body('name') name: string) {
    return this.subcategoriesService.create(categoryId, name);
  }

  @Roles('superadmin', 'seller')
  @Patch(':id')
  update(@Param('id') id: string, @Body('name') name: string) {
    return this.subcategoriesService.update(id, name);
  }

  @Roles('superadmin', 'seller')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subcategoriesService.remove(id);
  }
}
