import { Injectable, NotFoundException } from '@nestjs/common';
import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PrismaService } from '../../../database/postgres/prisma.service';

export class UpdateBookshopDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  email?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  address?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  city?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  country?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  openingHours?: string | null;
}

@Injectable()
export class BookshopService {
  constructor(private readonly prisma: PrismaService) {}

  async resolveBookshopForSeller(userId: string, bookshopId?: string | null) {
    if (bookshopId) {
      const found = await this.prisma.bookshop.findUnique({
        where: { id: bookshopId },
      });
      if (found) return found;
    }
    let fallback = await this.prisma.bookshop.findFirst({
      orderBy: { createdAt: 'asc' },
    });
    if (!fallback) {
      fallback = await this.prisma.bookshop.create({
        data: {
          name: 'BOOKDECK Default Bookstore',
          slug: `bookdeck-store-${Date.now()}`,
        },
      });
    }
    await this.prisma.user
      .update({
        where: { id: userId },
        data: { bookshopId: fallback.id },
      })
      .catch(() => {});
    return fallback;
  }

  async findOne(id: string) {
    const bookshop = await this.prisma.bookshop.findUnique({
      where: { id },
    });
    if (!bookshop) throw new NotFoundException('Bookshop not found');
    return bookshop;
  }

  async update(id: string, dto: UpdateBookshopDto) {
    return this.prisma.bookshop.update({
      where: { id },
      data: dto,
    });
  }
}
