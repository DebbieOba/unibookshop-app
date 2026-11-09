import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { UploadService } from '../../../integrations/object-storage/upload.service';
import { NotifyService } from '../../notification/notification.public-api';
import { paginate } from '../../../common/interfaces/paginated-response.interface';
import { BrowseBooksDto } from '../dto/browse-books.dto';
import { CreateBookDto } from '../dto/create-book.dto';
import { UpdateBookDto } from '../dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
    private readonly notify: NotifyService,
  ) {}

  async findAll(query: BrowseBooksDto) {
    const {
      page = 1,
      limit = 20,
      search,
      categoryId,
      subcategoryId,
      targetAudience,
      language,
      bookCondition,
      publisher,
      isbn,
      minPrice,
      maxPrice,
      inStockOnly,
      onSale,
      isPreOrder,
      courseCode,
      sort,
      bookshopId,
    } = query;

    const orderBy: Prisma.BookOrderByWithRelationInput | undefined =
      sort === 'newest'
        ? { createdAt: 'desc' }
        : sort === 'priceAsc'
          ? { price: 'asc' }
          : sort === 'priceDesc'
            ? { price: 'desc' }
            : undefined;

    const where: Prisma.BookWhereInput = {
      ...(bookshopId && { bookshopId }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
          { isbn: { contains: search, mode: 'insensitive' } },
          { publisher: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(subcategoryId && { subcategoryId }),
      ...(targetAudience && { targetAudience }),
      ...(language && { language }),
      ...(bookCondition && { bookCondition: bookCondition as any }),
      ...(publisher && {
        publisher: { contains: publisher, mode: 'insensitive' },
      }),
      ...(isbn && { isbn }),
      ...(inStockOnly && { stockQuantity: { gt: 0 } }),
      // compareAtPrice is only ever persisted when it's already > price (see
      // assertValidCompareAtPrice below), so "not null" is a safe, index-free
      // proxy for "on sale" without needing a column-to-column DB comparison.
      ...(onSale && { compareAtPrice: { not: null } }),
      ...(isPreOrder !== undefined && { isPreOrder }),
      ...(courseCode && { courseCode }),
      ...((minPrice !== undefined || maxPrice !== undefined) && {
        price: {
          ...(minPrice !== undefined && { gte: minPrice }),
          ...(maxPrice !== undefined && { lte: maxPrice }),
        },
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.book.findMany({
        where,
        ...(orderBy && { orderBy }),
        skip: (page - 1) * limit,
        take: limit,
        include: { category: true },
      }),
      this.prisma.book.count({ where }),
    ]);
    return paginate(data, total, page, limit);
  }

  async findOne(id: string) {
    const book = await this.prisma.book.findUnique({
      where: { id },
      include: { category: true, ratings: true },
    });
    if (!book) throw new NotFoundException('Book not found');
    return book;
  }

  private assertValidCompareAtPrice(
    price: number,
    compareAtPrice: number | null | undefined,
  ) {
    if (
      compareAtPrice !== undefined &&
      compareAtPrice !== null &&
      compareAtPrice <= price
    ) {
      throw new BadRequestException(
        'compareAtPrice must be greater than price',
      );
    }
  }

  create(dto: CreateBookDto, bookshopId?: string | null) {
    this.assertValidCompareAtPrice(dto.price, dto.compareAtPrice);
    return this.prisma.book.create({
      data: {
        ...dto,
        bookshopId: bookshopId ?? undefined,
      },
    });
  }

  async update(id: string, dto: UpdateBookDto, bookshopId?: string | null) {
    const existing = await this.findOne(id);
    if (
      bookshopId &&
      existing.bookshopId &&
      existing.bookshopId !== bookshopId
    ) {
      throw new BadRequestException('You do not have access to this book');
    }
    if (dto.compareAtPrice !== undefined) {
      this.assertValidCompareAtPrice(
        dto.price ?? Number(existing.price),
        dto.compareAtPrice,
      );
    }

    const updated = await this.prisma.book.update({ where: { id }, data: dto });

    // The book just became available — tell everyone who reserved it while
    // it was pre-order, then clear those reservations (they've served their
    // purpose; a re-marked pre-order later starts a fresh reservation list).
    if (existing.isPreOrder && dto.isPreOrder === false) {
      await this.notifyPreOrderReservers(updated.id, updated.title);
    }

    return updated;
  }

  private async notifyPreOrderReservers(bookId: string, bookTitle: string) {
    const reservations = await this.prisma.preOrderReservation.findMany({
      where: { bookId },
      include: { user: true },
    });
    for (const reservation of reservations) {
      await this.notify.notifyUser(reservation.user, {
        type: 'NEW_ARRIVAL',
        title: 'Pre-order now available',
        body: `"${bookTitle}" is now in stock and ready to order.`,
        data: { bookId },
      });
    }
    await this.prisma.preOrderReservation.deleteMany({ where: { bookId } });
  }

  async remove(id: string, bookshopId?: string | null) {
    const existing = await this.findOne(id);
    if (
      bookshopId &&
      existing.bookshopId &&
      existing.bookshopId !== bookshopId
    ) {
      throw new BadRequestException('You do not have access to this book');
    }
    return this.prisma.book.delete({ where: { id } });
  }

  async uploadCover(
    id: string,
    fileBuffer: Buffer,
    bookshopId?: string | null,
  ) {
    const existing = await this.findOne(id);
    if (
      bookshopId &&
      existing.bookshopId &&
      existing.bookshopId !== bookshopId
    ) {
      throw new BadRequestException('You do not have access to this book');
    }
    const coverUrl = await this.uploadService.uploadImage(
      fileBuffer,
      'book-covers',
    );
    return this.prisma.book.update({ where: { id }, data: { coverUrl } });
  }
  async uploadSample(
    id: string,
    fileBuffer: Buffer,
    bookshopId?: string | null,
  ) {
    const existing = await this.findOne(id);
    if (
      bookshopId &&
      existing.bookshopId &&
      existing.bookshopId !== bookshopId
    ) {
      throw new BadRequestException('You do not have access to this book');
    }
    const sampleUrl = await this.uploadService.uploadImage(
      fileBuffer,
      'book-samples',
    );
    const previewPages = existing.previewPages || [];
    return this.prisma.book.update({ 
      where: { id }, 
      data: { previewPages: [...previewPages, sampleUrl] } 
    });
  }
}
