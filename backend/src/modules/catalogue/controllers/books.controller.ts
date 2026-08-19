import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { Public } from '../../../common/decorators/public.decorator';
import { Roles } from '../../../common/decorators/roles.decorator';
import { RolesGuard } from '../../../common/guards/roles.guard';
import {
  AuditAction,
  AuditLogInterceptor,
} from '../../../common/interceptors/audit-log.interceptor';
import { BrowseBooksDto } from '../dto/browse-books.dto';
import { BooksService } from '../services/books.service';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';

import {
  CurrentUser,
  type CurrentUserPayload,
} from '../../../common/decorators/current-user.decorator';

@ApiTags('catalogue')
@UseInterceptors(AuditLogInterceptor)
@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) {}

  @Public()
  @Get()
  findAll(@Query() query: BrowseBooksDto) {
    return this.booksService.findAll(query);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.booksService.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @AuditAction('book.create')
  @Post()
  create(@Body() dto: CreateBookDto, @CurrentUser() user: CurrentUserPayload) {
    return this.booksService.create(dto, user.bookshopId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @AuditAction('book.update')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateBookDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.booksService.update(id, dto, user.bookshopId);
  }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseGuards(RolesGuard)
  @Roles('admin')
  @AuditAction('book.cover-upload')
  @Post(':id/cover')
  @UseInterceptors(FileInterceptor('file'))
  uploadCover(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.booksService.uploadCover(id, file.buffer, user.bookshopId);
  }

  @ApiBearerAuth()
  @UseGuards(RolesGuard)
  @Roles('admin')
  @AuditAction('book.delete')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.booksService.remove(id, user.bookshopId);
  }
}
