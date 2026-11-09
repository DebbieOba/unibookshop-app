import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Order, OrderItem } from '@prisma/client';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { StockService } from '../../catalogue/catalogue.public-api';
import { NotifyService } from '../../notification/notification.public-api';
import { PromoCodesService } from '../../promotions/promotions.public-api';
import {
  FLUTTERWAVE_PROVIDER,
  PAYSTACK_PROVIDER,
  type PaymentProvider,
  type PaymentStatus,
} from '../../../integrations/payments/payment-provider.interface';
import { Inject } from '@nestjs/common';
import { CartService } from './cart.service';
import { CheckoutDto } from '../dto/checkout.dto';
import { CurrentUserPayload } from '../../../common/decorators/current-user.decorator';

@Injectable()
export class CheckoutService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cart: CartService,
    private readonly stock: StockService,
    private readonly notify: NotifyService,
    private readonly promoCodes: PromoCodesService,
    @Inject(PAYSTACK_PROVIDER) private readonly paystack: PaymentProvider,
    @Inject(FLUTTERWAVE_PROVIDER) private readonly flutterwave: PaymentProvider,
  ) {}

  async checkout(user: CurrentUserPayload, dto: CheckoutDto) {
    const { items, subtotal, promoCode } = await this.cart.get(user.id);
    if (items.length === 0) {
      throw new BadRequestException('Cart is empty');
    }

    for (const item of items) {
      const available = await this.stock.checkAvailability(
        item.bookId,
        item.quantity,
      );
      if (!available) {
        throw new BadRequestException(
          `Insufficient stock for "${item.book.title}"`,
        );
      }
    }

    // Re-validate the promo fresh at checkout rather than trusting the cart's
    // cached discount — the code, its usage limit, or the subtotal itself may
    // have changed since it was applied.
    const promo = promoCode
      ? await this.promoCodes.validate(promoCode, subtotal)
      : null;
    const discountAmount = promo?.discountAmount ?? 0;
    const total = Math.max(0, subtotal - discountAmount);

    // Both providers are called with the order id as the reference (see
    // PaystackProvider/FlutterwaveProvider), so it doubles as paymentReference
    // up front — avoids a placeholder value colliding with the unique constraint.
    const order = await this.prisma.order.create({
      data: {
        userId: user.id,
        status: 'PROCESSING',
        deliveryMethod: dto.deliveryMethod,
        addressId: dto.addressId,
        subtotalAmount: subtotal,
        discountAmount,
        promoCodeId: promo?.id,
        totalAmount: total,
        paymentProvider: dto.paymentProvider,
        bookshopId:
          user.bookshopId ??
          ((items[0]?.book as { bookshopId?: string | null } | undefined)
            ?.bookshopId ??
            null),
        // paymentReference is set in the follow-up update below, once the
        // provider gives us one — nullable in the schema for exactly this gap.
        items: {
          create: items.map((item) => ({
            bookId: item.bookId,
            titleSnapshot: item.book.title,
            unitPrice: item.book.price,
            compareAtPriceSnapshot: item.book.compareAtPrice,
            costPriceSnapshot: item.book.costPrice,
            quantity: item.quantity,
          })),
        },
      },
    });

    for (const item of items) {
      await this.stock.reserveStock(item.bookId, item.quantity);
    }
    if (promo) {
      await this.promoCodes.redeem(promo.id);
    }

    const provider =
      dto.paymentProvider === 'PAYSTACK' ? this.paystack : this.flutterwave;
    const { redirectUrl, reference } = await provider.initialize({
      id: order.id,
      totalAmount: total,
      userEmail: user.email,
    });

    await this.prisma.order.update({
      where: { id: order.id },
      data: { paymentReference: reference },
    });
    await this.cart.clear(user.id);

    return { orderId: order.id, redirectUrl };
  }

  /** Called from the provider webhook controllers after signature verification. */
  async handlePaymentEvent(reference: string, status: PaymentStatus, verifiedAmount?: number) {
    if (status === 'PENDING') return; // nothing resolved yet — order stays PROCESSING

    const order = await this.prisma.order.findUnique({
      where: { paymentReference: reference },
      include: { items: true },
    });
    if (!order) return;

    // Security Verification: Assert webhook payment amount matches order total amount
    if (status === 'SUCCESSFUL' && verifiedAmount !== undefined) {
      const orderTotal = Number(order.totalAmount);
      // Allow minor floating point epsilon (< 0.01 NGN)
      if (Math.abs(verifiedAmount - orderTotal) > 0.01) {
        throw new BadRequestException(
          `Payment amount mismatch: received ${verifiedAmount}, expected ${orderTotal}`,
        );
      }
    }

    await this.applyPaymentStatus(order, order.items, status);
  }

  /**
   * Fallback for when the provider's webhook can't reach this server (e.g.
   * local dev on a LAN-only backend) or simply hasn't landed yet — actively
   * asks the provider for the transaction status instead of waiting.
   * Ownership-checked the same way as OrdersService.findOne (see
   * backend-architecture.md §10.2.4) since this is user-triggered, not a
   * signature-verified webhook call.
   */
  async verifyPayment(orderId: string, requestingUser: CurrentUserPayload) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (
      order.userId !== requestingUser.id &&
      requestingUser.role !== 'seller'
    ) {
      throw new ForbiddenException();
    }

    if (order.status !== 'PROCESSING' || !order.paymentReference) {
      return order; // already resolved (or never got a reference) — nothing to check
    }

    const provider =
      order.paymentProvider === 'PAYSTACK' ? this.paystack : this.flutterwave;
    const status = await provider.verify(order.paymentReference);
    if (status === 'PENDING') return order;

    return this.applyPaymentStatus(order, order.items, status);
  }

  /**
   * Admin-initiated manual status change (cancel-with-reason, or a
   * complete-override for e.g. cash-on-pickup) — distinct from
   * applyPaymentStatus, which is payment-provider-driven. Scoped to
   * transitions out of PROCESSING only, so a resolved order can never be
   * re-touched. Uses an atomic conditional updateMany (same idiom as
   * StockService.reserveStock) rather than a read-then-write, so this can't
   * race a webhook/verify-payment resolving the same order concurrently.
   */
  async adminUpdateStatus(
    orderId: string,
    status: 'CANCELLED' | 'COMPLETED',
    reason?: string,
  ) {
    const result = await this.prisma.order.updateMany({
      where: { id: orderId, status: 'PROCESSING' },
      data: { status, adminStatusReason: reason ?? null },
    });

    if (result.count === 0) {
      const current = await this.prisma.order.findUnique({
        where: { id: orderId },
      });
      if (!current) throw new NotFoundException('Order not found');
      throw new ConflictException(
        `Order is already ${current.status} — no further status changes allowed`,
      );
    }

    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: true },
    });

    if (status === 'CANCELLED') {
      // Stock was decremented at checkout time — give it back, same as a
      // failed/cancelled payment does in applyPaymentStatus.
      for (const item of order.items) {
        await this.stock.releaseStock(item.bookId, item.quantity);
      }
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: order.userId },
    });
    await this.notify.notifyUser(user, {
      type: 'ORDER_UPDATE',
      title: status === 'COMPLETED' ? 'Order completed' : 'Order cancelled',
      body:
        status === 'COMPLETED'
          ? `Order ${order.id} has been marked completed by an admin.`
          : `Order ${order.id} was cancelled by an admin. Reason: ${reason}`,
      data: { orderId: order.id },
    });

    return order;
  }

  private async applyPaymentStatus(
    order: Order,
    items: OrderItem[],
    status: 'SUCCESSFUL' | 'FAILED',
  ) {
    const newStatus = status === 'SUCCESSFUL' ? 'COMPLETED' : 'CANCELLED';
    if (newStatus === order.status) return order; // idempotent — already applied

    const updated = await this.prisma.order.update({
      where: { id: order.id },
      data: { status: newStatus },
    });

    if (newStatus === 'CANCELLED') {
      // Stock was decremented at checkout time (reserveStock) against the
      // expectation that the payment would go through — a failed/cancelled
      // payment must give that inventory back.
      for (const item of items) {
        await this.stock.releaseStock(item.bookId, item.quantity);
      }
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: order.userId },
    });
    await this.notify.notifyUser(user, {
      type: 'ORDER_UPDATE',
      title: newStatus === 'COMPLETED' ? 'Order confirmed' : 'Order cancelled',
      body: `Order ${order.id} is now ${newStatus.toLowerCase()}.`,
      data: { orderId: order.id },
    });

    // Notify the bookshop seller about the new sale
    if (newStatus === 'COMPLETED' && order.bookshopId) {
      const sellers = await this.prisma.user.findMany({
        where: { bookshopId: order.bookshopId, role: 'seller' as any },
        select: { id: true, email: true },
      });
      const itemSummary = items
        .slice(0, 2)
        .map((i) => `${i.quantity}x ${i.titleSnapshot}`)
        .join(', ');
      const moreItems = items.length > 2 ? ` +${items.length - 2} more` : '';
      for (const seller of sellers) {
        await this.notify.notifyUser(seller, {
          type: 'NEW_SALE' as any,
          title: '💰 New Sale!',
          body: `A customer purchased ${itemSummary}${moreItems}. Order #${order.id.slice(-6)} — ₦${Math.round(Number(updated.totalAmount)).toLocaleString()}`,
          data: { orderId: order.id },
        });
      }
    }

    return updated;
  }
}
