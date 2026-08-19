import { Test } from '@nestjs/testing';
import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { CheckoutService } from './checkout.service';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { CartService } from './cart.service';
import { StockService } from '../../catalogue/catalogue.public-api';
import { NotifyService } from '../../notification/notification.public-api';
import { PromoCodesService } from '../../promotions/promotions.public-api';
import { PAYSTACK_PROVIDER, FLUTTERWAVE_PROVIDER } from '../../../integrations/payments/payment-provider.interface';
import { CurrentUserPayload } from '../../../common/decorators/current-user.decorator';

describe('CheckoutService', () => {
  let service: CheckoutService;
  let prisma: any;
  let cart: { get: jest.Mock; clear: jest.Mock };
  let stock: { checkAvailability: jest.Mock; reserveStock: jest.Mock; releaseStock: jest.Mock };
  let notify: { notifyUser: jest.Mock };
  let promoCodes: { validate: jest.Mock; redeem: jest.Mock };
  let paystack: { initialize: jest.Mock; verify: jest.Mock };
  let flutterwave: { initialize: jest.Mock; verify: jest.Mock };

  const user: CurrentUserPayload = {
    id: 'user-1',
    email: 'student@example.com',
    role: 'student',
    accountState: 'APPROVED',
  };

  beforeEach(async () => {
    prisma = {
      order: {
        create: jest.fn(),
        update: jest.fn(),
        updateMany: jest.fn(),
        findUnique: jest.fn(),
        findUniqueOrThrow: jest.fn(),
      },
      user: { findUniqueOrThrow: jest.fn() },
    };
    cart = { get: jest.fn(), clear: jest.fn() };
    stock = { checkAvailability: jest.fn(), reserveStock: jest.fn(), releaseStock: jest.fn() };
    notify = { notifyUser: jest.fn() };
    promoCodes = { validate: jest.fn(), redeem: jest.fn() };
    paystack = { initialize: jest.fn(), verify: jest.fn() };
    flutterwave = { initialize: jest.fn(), verify: jest.fn() };

    const module = await Test.createTestingModule({
      providers: [
        CheckoutService,
        { provide: PrismaService, useValue: prisma },
        { provide: CartService, useValue: cart },
        { provide: StockService, useValue: stock },
        { provide: NotifyService, useValue: notify },
        { provide: PromoCodesService, useValue: promoCodes },
        { provide: PAYSTACK_PROVIDER, useValue: paystack },
        { provide: FLUTTERWAVE_PROVIDER, useValue: flutterwave },
      ],
    }).compile();

    service = module.get(CheckoutService);
  });

  describe('checkout', () => {
    it('rejects an empty cart before touching the database', async () => {
      cart.get.mockResolvedValue({ items: [], subtotal: 0, total: 0, discountAmount: 0, promoCode: null });
      await expect(
        service.checkout(user, { deliveryMethod: 'PICKUP', paymentProvider: 'PAYSTACK' }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.order.create).not.toHaveBeenCalled();
    });

    it('rejects checkout when any line item is out of stock', async () => {
      cart.get.mockResolvedValue({
        items: [{ bookId: 'b1', quantity: 2, book: { id: 'b1', title: 'Book One', price: 10, compareAtPrice: null } }],
        subtotal: 20,
        total: 20,
        discountAmount: 0,
        promoCode: null,
      });
      stock.checkAvailability.mockResolvedValue(false);

      await expect(
        service.checkout(user, { deliveryMethod: 'PICKUP', paymentProvider: 'PAYSTACK' }),
      ).rejects.toThrow(BadRequestException);
      expect(prisma.order.create).not.toHaveBeenCalled();
    });

    it('creates the order, reserves stock, initializes payment, and clears the cart', async () => {
      cart.get.mockResolvedValue({
        items: [{ bookId: 'b1', quantity: 2, book: { id: 'b1', title: 'Book One', price: 10, compareAtPrice: null } }],
        subtotal: 20,
        total: 20,
        discountAmount: 0,
        promoCode: null,
      });
      stock.checkAvailability.mockResolvedValue(true);
      prisma.order.create.mockResolvedValue({ id: 'order-1' });
      paystack.initialize.mockResolvedValue({ redirectUrl: 'https://pay.example/x', reference: 'order-1' });

      const result = await service.checkout(user, {
        deliveryMethod: 'PICKUP',
        paymentProvider: 'PAYSTACK',
      });

      expect(stock.reserveStock).toHaveBeenCalledWith('b1', 2);
      expect(promoCodes.redeem).not.toHaveBeenCalled();
      expect(paystack.initialize).toHaveBeenCalledWith({
        id: 'order-1',
        totalAmount: 20,
        userEmail: user.email,
      });
      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { paymentReference: 'order-1' },
      });
      expect(cart.clear).toHaveBeenCalledWith(user.id);
      expect(result).toEqual({ orderId: 'order-1', redirectUrl: 'https://pay.example/x' });
    });

    it('applies a valid promo code to the order total and redeems it', async () => {
      cart.get.mockResolvedValue({
        items: [{ bookId: 'b1', quantity: 2, book: { id: 'b1', title: 'Book One', price: 10, compareAtPrice: null } }],
        subtotal: 20,
        total: 18,
        discountAmount: 2,
        promoCode: 'FUTA10',
      });
      stock.checkAvailability.mockResolvedValue(true);
      promoCodes.validate.mockResolvedValue({ id: 'promo-1', code: 'FUTA10', discountAmount: 2 });
      prisma.order.create.mockResolvedValue({ id: 'order-3' });
      paystack.initialize.mockResolvedValue({ redirectUrl: 'https://pay.example/z', reference: 'order-3' });

      await service.checkout(user, { deliveryMethod: 'PICKUP', paymentProvider: 'PAYSTACK' });

      expect(promoCodes.validate).toHaveBeenCalledWith('FUTA10', 20);
      expect(prisma.order.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ subtotalAmount: 20, discountAmount: 2, promoCodeId: 'promo-1', totalAmount: 18 }),
        }),
      );
      expect(promoCodes.redeem).toHaveBeenCalledWith('promo-1');
      expect(paystack.initialize).toHaveBeenCalledWith({ id: 'order-3', totalAmount: 18, userEmail: user.email });
    });

    it('routes to Flutterwave when that provider is selected', async () => {
      cart.get.mockResolvedValue({
        items: [{ bookId: 'b1', quantity: 1, book: { id: 'b1', title: 'Book One', price: 10, compareAtPrice: null } }],
        subtotal: 10,
        total: 10,
        discountAmount: 0,
        promoCode: null,
      });
      stock.checkAvailability.mockResolvedValue(true);
      prisma.order.create.mockResolvedValue({ id: 'order-2' });
      flutterwave.initialize.mockResolvedValue({ redirectUrl: 'https://flw.example/y', reference: 'order-2' });

      await service.checkout(user, { deliveryMethod: 'PICKUP', paymentProvider: 'FLUTTERWAVE' });

      expect(flutterwave.initialize).toHaveBeenCalled();
      expect(paystack.initialize).not.toHaveBeenCalled();
    });
  });

  describe('handlePaymentEvent', () => {
    it('does nothing when no order matches the reference', async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await service.handlePaymentEvent('unknown-ref', 'SUCCESSFUL');
      expect(prisma.order.update).not.toHaveBeenCalled();
      expect(notify.notifyUser).not.toHaveBeenCalled();
    });

    it('is idempotent — a second event for the same status is a no-op', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', userId: 'user-1', status: 'COMPLETED' });
      await service.handlePaymentEvent('order-1', 'SUCCESSFUL');
      expect(prisma.order.update).not.toHaveBeenCalled();
      expect(notify.notifyUser).not.toHaveBeenCalled();
    });

    it('transitions PROCESSING -> COMPLETED on a successful event, notifies the user, and does not touch stock', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'PROCESSING',
        items: [{ bookId: 'b1', quantity: 2 }],
      });
      prisma.user.findUniqueOrThrow.mockResolvedValue({ id: 'user-1', email: user.email });

      await service.handlePaymentEvent('order-1', 'SUCCESSFUL');

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'COMPLETED' },
      });
      expect(stock.releaseStock).not.toHaveBeenCalled();
      expect(notify.notifyUser).toHaveBeenCalledWith(
        { id: 'user-1', email: user.email },
        expect.objectContaining({ type: 'ORDER_UPDATE', title: 'Order confirmed' }),
      );
    });

    it('transitions PROCESSING -> CANCELLED on a failed event and releases the reserved stock', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'PROCESSING',
        items: [
          { bookId: 'b1', quantity: 2 },
          { bookId: 'b2', quantity: 1 },
        ],
      });
      prisma.user.findUniqueOrThrow.mockResolvedValue({ id: 'user-1', email: user.email });

      await service.handlePaymentEvent('order-1', 'FAILED');

      expect(prisma.order.update).toHaveBeenCalledWith({
        where: { id: 'order-1' },
        data: { status: 'CANCELLED' },
      });
      expect(stock.releaseStock).toHaveBeenCalledWith('b1', 2);
      expect(stock.releaseStock).toHaveBeenCalledWith('b2', 1);
    });
  });

  describe('verifyPayment', () => {
    it('throws 404 when the order does not exist', async () => {
      prisma.order.findUnique.mockResolvedValue(null);
      await expect(service.verifyPayment('missing-order', user)).rejects.toThrow(NotFoundException);
    });

    it('throws 403 when a different, non-admin user requests it', async () => {
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', userId: 'someone-else', status: 'PROCESSING' });
      await expect(service.verifyPayment('order-1', user)).rejects.toThrow(ForbiddenException);
    });

    it('short-circuits without calling the provider when the order is already resolved', async () => {
      const resolvedOrder = { id: 'order-1', userId: 'user-1', status: 'COMPLETED', paymentReference: 'order-1' };
      prisma.order.findUnique.mockResolvedValue(resolvedOrder);

      const result = await service.verifyPayment('order-1', user);

      expect(result).toEqual(resolvedOrder);
      expect(paystack.verify).not.toHaveBeenCalled();
      expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('calls the correct provider and applies a resolved SUCCESSFUL status', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'PROCESSING',
        paymentProvider: 'PAYSTACK',
        paymentReference: 'order-1',
        items: [{ bookId: 'b1', quantity: 1 }],
      });
      prisma.user.findUniqueOrThrow.mockResolvedValue({ id: 'user-1', email: user.email });
      paystack.verify.mockResolvedValue('SUCCESSFUL');

      await service.verifyPayment('order-1', user);

      expect(paystack.verify).toHaveBeenCalledWith('order-1');
      expect(flutterwave.verify).not.toHaveBeenCalled();
      expect(prisma.order.update).toHaveBeenCalledWith({ where: { id: 'order-1' }, data: { status: 'COMPLETED' } });
    });

    it('is a no-op when the provider still reports PENDING', async () => {
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'PROCESSING',
        paymentProvider: 'FLUTTERWAVE',
        paymentReference: 'order-1',
        items: [],
      });
      flutterwave.verify.mockResolvedValue('PENDING');

      await service.verifyPayment('order-1', user);

      expect(prisma.order.update).not.toHaveBeenCalled();
    });

    it('lets an admin verify another student\'s order', async () => {
      const admin: CurrentUserPayload = { id: 'admin-1', email: 'admin@example.com', role: 'admin', accountState: 'APPROVED' };
      prisma.order.findUnique.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'PROCESSING',
        paymentProvider: 'PAYSTACK',
        paymentReference: 'order-1',
        items: [],
      });
      prisma.user.findUniqueOrThrow.mockResolvedValue({ id: 'user-1', email: user.email });
      prisma.order.update.mockResolvedValue({ id: 'order-1', status: 'CANCELLED' });
      paystack.verify.mockResolvedValue('FAILED');

      await service.verifyPayment('order-1', admin);

      expect(prisma.order.update).toHaveBeenCalledWith({ where: { id: 'order-1' }, data: { status: 'CANCELLED' } });
    });
  });

  describe('adminUpdateStatus', () => {
    it('cancels a PROCESSING order with a reason, releases stock per item, and notifies', async () => {
      prisma.order.updateMany.mockResolvedValue({ count: 1 });
      prisma.order.findUniqueOrThrow.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'CANCELLED',
        items: [
          { bookId: 'b1', quantity: 2 },
          { bookId: 'b2', quantity: 1 },
        ],
      });
      prisma.user.findUniqueOrThrow.mockResolvedValue({ id: 'user-1', email: user.email });

      await service.adminUpdateStatus('order-1', 'CANCELLED', 'Customer requested cancellation');

      expect(prisma.order.updateMany).toHaveBeenCalledWith({
        where: { id: 'order-1', status: 'PROCESSING' },
        data: { status: 'CANCELLED', adminStatusReason: 'Customer requested cancellation' },
      });
      expect(stock.releaseStock).toHaveBeenCalledWith('b1', 2);
      expect(stock.releaseStock).toHaveBeenCalledWith('b2', 1);
      expect(notify.notifyUser).toHaveBeenCalledWith(
        { id: 'user-1', email: user.email },
        expect.objectContaining({ type: 'ORDER_UPDATE', title: 'Order cancelled' }),
      );
    });

    it('completes a PROCESSING order without touching stock', async () => {
      prisma.order.updateMany.mockResolvedValue({ count: 1 });
      prisma.order.findUniqueOrThrow.mockResolvedValue({
        id: 'order-1',
        userId: 'user-1',
        status: 'COMPLETED',
        items: [{ bookId: 'b1', quantity: 2 }],
      });
      prisma.user.findUniqueOrThrow.mockResolvedValue({ id: 'user-1', email: user.email });

      await service.adminUpdateStatus('order-1', 'COMPLETED');

      expect(stock.releaseStock).not.toHaveBeenCalled();
      expect(notify.notifyUser).toHaveBeenCalledWith(
        { id: 'user-1', email: user.email },
        expect.objectContaining({ type: 'ORDER_UPDATE', title: 'Order completed' }),
      );
    });

    it('throws ConflictException — not a silent no-op — when the order is already resolved', async () => {
      prisma.order.updateMany.mockResolvedValue({ count: 0 });
      prisma.order.findUnique.mockResolvedValue({ id: 'order-1', status: 'COMPLETED' });

      await expect(service.adminUpdateStatus('order-1', 'CANCELLED', 'too late')).rejects.toThrow(
        ConflictException,
      );
      expect(stock.releaseStock).not.toHaveBeenCalled();
      expect(notify.notifyUser).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when the order does not exist', async () => {
      prisma.order.updateMany.mockResolvedValue({ count: 0 });
      prisma.order.findUnique.mockResolvedValue(null);

      await expect(service.adminUpdateStatus('missing-order', 'CANCELLED', 'n/a')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
