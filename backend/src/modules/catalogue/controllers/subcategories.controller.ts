import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import { SubcategoriesService } from '../services/subcategories.service';

export class CreateSubcategoryDto {
  @ApiProperty({ format: 'uuid' })
  @IsUUID()
  categoryId!: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class UpdateSubcategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name!: string;
}

@ApiTags('catalogue')
@Controller('subcategories')
export class SubcategoriesController {
  constructor(private readonly subcategoriesService: SubcategoriesService) {}

  @Public()
  @Get()
  findAll(@Query('categoryId') categoryId?: string) {
    return this.subcategoriesService.findAll(categoryId);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.subcategoriesService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('superadmin', 'seller')
  @Post()
  create(@Body() dto: CreateSubcategoryDto) {
    return this.subcategoriesService.create(dto.categoryId, dto.name);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('superadmin', 'seller')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateSubcategoryDto) {
    return this.subcategoriesService.update(id, dto.name);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('superadmin', 'seller')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subcategoriesService.remove(id);
  }
}
