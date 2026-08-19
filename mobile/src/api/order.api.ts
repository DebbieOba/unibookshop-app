import { api } from './client';
import { Cart, DeliveryMethod, Order, PaymentProvider, SavingsSummary, SyllabusCourseProgress } from '../types/order';

export const orderApi = {
  getCart: () => api.get<Cart>('/cart'),

  setCartLine: (bookId: string, quantity: number) => api.post<Cart>('/cart', { bookId, quantity }),

  applyPromoCode: (code: string) => api.post<Cart>('/cart/promo', { code }),

  removePromoCode: () => api.delete<Cart>('/cart/promo'),

  checkout: (payload: { deliveryMethod: DeliveryMethod; addressId?: string; paymentProvider: PaymentProvider }) =>
    api.post<{ orderId: string; redirectUrl: string }>('/checkout', payload),

  getOrders: () => api.get<Order[]>('/orders'),

  getOrderById: (id: string) => api.get<Order>(`/orders/${id}`),

  verifyPayment: (id: string) => api.post<Order>(`/orders/${id}/verify-payment`),

  getSavingsSummary: () => api.get<SavingsSummary>('/orders/savings-summary'),

  getSyllabusProgress: () => api.get<SyllabusCourseProgress[]>('/orders/syllabus-progress'),
};
