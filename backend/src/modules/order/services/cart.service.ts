import { Injectable } from '@nestjs/common';
import { RedisService } from '../../../database/redis/redis.service';
import { BookLookupService } from '../../catalogue/catalogue.public-api';
import { PromoCodesService } from '../../promotions/promotions.public-api';

const CART_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

interface CartLine {
  bookId: string;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  promoCode?: string;
}

@Injectable()
export class CartService {
  constructor(
    private readonly redis: RedisService,
    private readonly bookLookup: BookLookupService,
    private readonly promoCodes: PromoCodesService,
  ) {}

  private key(userId: string) {
    return `cart:${userId}`;
  }

  private async readState(userId: string): Promise<CartState> {
    const raw = await this.redis.get(this.key(userId));
    if (!raw) return { lines: [] };
    const parsed = JSON.parse(raw);
    // Back-compat: carts written before promo codes existed are a bare array of lines.
    return Array.isArray(parsed)
      ? { lines: parsed }
      : { lines: parsed.lines ?? [], promoCode: parsed.promoCode };
  }

  private async writeState(userId: string, state: CartState) {
    await this.redis.set(
      this.key(userId),
      JSON.stringify(state),
      'EX',
      CART_TTL_SECONDS,
    );
  }

  async get(userId: string) {
    const state = await this.readState(userId);
    const items = await Promise.all(
      state.lines.map(async (line) => ({
        ...line,
        book: await this.bookLookup.getSnapshot(line.bookId),
      })),
    );
    const subtotal = items.reduce(
      (sum, item) => sum + item.book.price * item.quantity,
      0,
    );

    if (!state.promoCode) {
      return {
        items,
        subtotal,
        total: subtotal,
        discountAmount: 0,
        promoCode: null,
      };
    }

    try {
      const result = await this.promoCodes.validate(state.promoCode, subtotal);
      return {
        items,
        subtotal,
        discountAmount: result.discountAmount,
        total: Math.max(0, subtotal - result.discountAmount),
        promoCode: result.code,
      };
    } catch {
      // The applied code has since gone invalid (expired/deactivated/below
      // minimum) — self-heal by dropping it rather than surfacing an error
      // on every cart fetch.
      await this.writeState(userId, { lines: state.lines });
      return {
        items,
        subtotal,
        total: subtotal,
        discountAmount: 0,
        promoCode: null,
      };
    }
  }

  async setLine(userId: string, bookId: string, quantity: number) {
    const state = await this.readState(userId);
    const existing = state.lines.find((l) => l.bookId === bookId);
    if (existing) {
      existing.quantity = quantity;
    } else {
      state.lines.push({ bookId, quantity });
    }
    await this.writeState(userId, state);
    return this.get(userId);
  }

  async removeLine(userId: string, bookId: string) {
    const state = await this.readState(userId);
    state.lines = state.lines.filter((l) => l.bookId !== bookId);
    await this.writeState(userId, state);
    return this.get(userId);
  }

  async applyPromo(userId: string, code: string) {
    const state = await this.readState(userId);
    const subtotal = (
      await Promise.all(
        state.lines.map((line) => this.bookLookup.getSnapshot(line.bookId)),
      )
    ).reduce((sum, book, i) => sum + book.price * state.lines[i].quantity, 0);
    // Validate up front so an invalid code never gets persisted onto the cart.
    await this.promoCodes.validate(code, subtotal);
    await this.writeState(userId, {
      ...state,
      promoCode: code.trim().toUpperCase(),
    });
    return this.get(userId);
  }

  async removePromo(userId: string) {
    const state = await this.readState(userId);
    await this.writeState(userId, { lines: state.lines });
    return this.get(userId);
  }

  async clear(userId: string) {
    await this.redis.del(this.key(userId));
  }
}
