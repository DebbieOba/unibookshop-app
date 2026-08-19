import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { UploadService } from '../../../integrations/object-storage/upload.service';
import { paginate } from '../../../common/interfaces/paginated-response.interface';
import { CurrentUserPayload } from '../../../common/decorators/current-user.decorator';
import { BrowseListingsDto } from '../dto/browse-listings.dto';
import { CreateListingDto } from '../dto/create-listing.dto';
import { UpdateListingDto } from '../dto/update-listing.dto';

const MAX_IMAGES = 3;

const sellerSelect = {
  id: true,
  profile: { select: { fullName: true, avatarUrl: true, phone: true } },
} satisfies Prisma.UserSelect;

function shapeSeller(seller: {
  id: string;
  profile: {
    fullName: string;
    avatarUrl: string | null;
    phone: string | null;
  } | null;
}) {
  return {
    id: seller.id,
    fullName: seller.profile?.fullName ?? 'CURRICULA student',
    avatarUrl: seller.profile?.avatarUrl ?? null,
    phone: seller.profile?.phone ?? null,
  };
}

@Injectable()
export class ListingsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly uploadService: UploadService,
  ) {}

  async findAll(query: BrowseListingsDto, currentUserId?: string) {
    const { page = 1, limit = 20, search, condition, mine } = query;

    const where: Prisma.ListingWhereInput = {
      ...(mine && currentUserId
        ? { sellerId: currentUserId }
        : { status: 'AVAILABLE' }),
      ...(condition && { condition }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { author: { contains: search, mode: 'insensitive' } },
          { courseCode: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.listing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { seller: { select: sellerSelect } },
      }),
      this.prisma.listing.count({ where }),
    ]);

    return paginate(
      data.map((listing) => ({
        ...listing,
        price: Number(listing.price),
        seller: shapeSeller(listing.seller),
      })),
      total,
      page,
      limit,
    );
  }

  async findOne(id: string) {
    const listing = await this.prisma.listing.findUnique({
      where: { id },
      include: { seller: { select: sellerSelect } },
    });
    if (!listing) throw new NotFoundException('Listing not found');
    return {
      ...listing,
      price: Number(listing.price),
      seller: shapeSeller(listing.seller),
    };
  }

  async create(
    user: CurrentUserPayload,
    dto: CreateListingDto,
    files: Express.Multer.File[],
  ) {
    const images = await Promise.all(
      files
        .slice(0, MAX_IMAGES)
        .map((file) =>
          this.uploadService.uploadImage(file.buffer, 'exchange-listings'),
        ),
    );
    return this.prisma.listing.create({
      data: { ...dto, sellerId: user.id, images },
    });
  }

  private async assertOwnsListing(id: string, user: CurrentUserPayload) {
    const listing = await this.prisma.listing.findUnique({ where: { id } });
    if (!listing) throw new NotFoundException('Listing not found');
    if (listing.sellerId !== user.id && user.role !== 'admin') {
      throw new ForbiddenException('You can only manage your own listings');
    }
    return listing;
  }

  async update(id: string, user: CurrentUserPayload, dto: UpdateListingDto) {
    await this.assertOwnsListing(id, user);
    return this.prisma.listing.update({ where: { id }, data: dto });
  }

  async remove(id: string, user: CurrentUserPayload) {
    await this.assertOwnsListing(id, user);
    await this.prisma.listing.delete({ where: { id } });
  }
}
