import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { CurrentUserPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  findMine(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Ownership check lives here, next to the query it protects — see
   * backend-architecture.md §10.2.4. Never bypass this by querying Order
   * directly from another module/controller.
   */
  async findOne(id: string, requestingUser: CurrentUserPayload) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        // Only useful to the requester when they're an admin viewing someone
        // else's order, but harmless (and simpler) to always include.
        user: { select: { email: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (
      order.userId !== requestingUser.id &&
      requestingUser.role !== 'seller'
    ) {
      throw new ForbiddenException();
    }
    if (
      requestingUser.role === 'seller' &&
      requestingUser.bookshopId &&
      order.bookshopId !== requestingUser.bookshopId
    ) {
      throw new ForbiddenException('You do not have access to this order');
    }
    return order;
  }

  findAllForAdmin(
    status?: 'PROCESSING' | 'COMPLETED' | 'CANCELLED',
    bookshopId?: string | null,
  ) {
    return this.prisma.order.findMany({
      where: {
        ...(status && { status }),
        ...(bookshopId && { bookshopId }),
      },
      include: { items: true, user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async refundOrder(orderId: string, amount: number, reason: string, bookshopId: string) {
    if (!bookshopId) throw new BadRequestException('Seller must be associated with a bookshop');
    const order = await this.prisma.order.findUnique({
      where: { id: orderId, bookshopId },
    });
    if (!order) throw new NotFoundException('Order not found');

    if (amount <= 0) {
      throw new BadRequestException('Refund amount must be greater than zero');
    }
    
    return this.prisma.refund.create({
      data: {
        orderId,
        amount,
        reason,
        bookshopId,
      },
    });
  }
}
