import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getKpis(bookshopId?: string | null) {
    const where = bookshopId ? { bookshopId } : {};
    const wherePendingApprovals = bookshopId
      ? { bookshopId, accountState: 'PENDING' }
      : { accountState: 'PENDING' };

    const [
      totalUsers,
      pendingApprovals,
      totalBooks,
      totalOrders,
      recentOrders,
    ] = await Promise.all([
      this.prisma.user.count({
        where: bookshopId ? { bookshopId } : undefined,
      }),
      this.prisma.user.count({ where: wherePendingApprovals as any }),
      this.prisma.book.count({ where }),
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      totalUsers,
      pendingApprovals,
      totalBooks,
      totalOrders,
      recentOrders,
    };
  }

  async getProfitLoss(bookshopId: string, range = '30d') {
    let startDate: Date | undefined;
    const today = new Date();

    if (range === '7d') {
      startDate = new Date();
      startDate.setDate(today.getDate() - 7);
      startDate.setHours(0, 0, 0, 0);
    } else if (range === '30d') {
      startDate = new Date();
      startDate.setDate(today.getDate() - 30);
      startDate.setHours(0, 0, 0, 0);
    }

    const orders = await this.prisma.order.findMany({
      where: {
        bookshopId,
        status: 'COMPLETED',
        ...(startDate && { createdAt: { gte: startDate } }),
      },
      include: {
        items: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const dailyMap = new Map<
      string,
      {
        date: string;
        revenue: number;
        cost: number;
        profit: number;
        orderCount: number;
      }
    >();

    // Pre-populate dailyMap with all days in range to avoid gaps
    const length = range === '7d' ? 7 : range === '30d' ? 30 : 0;
    if (length > 0) {
      for (let i = 0; i < length; i++) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyMap.set(dateStr, {
          date: dateStr,
          revenue: 0,
          cost: 0,
          profit: 0,
          orderCount: 0,
        });
      }
    }

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;

    for (const order of orders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      const revenue = Number(order.totalAmount);
      let cost = 0;
      for (const item of order.items) {
        cost += Number(item.costPriceSnapshot) * item.quantity;
      }
      const profit = revenue - cost;

      totalRevenue += revenue;
      totalCost += cost;
      totalProfit += profit;

      const existing = dailyMap.get(dateStr) || {
        date: dateStr,
        revenue: 0,
        cost: 0,
        profit: 0,
        orderCount: 0,
      };
      existing.revenue += revenue;
      existing.cost += cost;
      existing.profit += profit;
      existing.orderCount += 1;
      dailyMap.set(dateStr, existing);
    }

    const dailyBreakdown = Array.from(dailyMap.values()).sort((a, b) =>
      b.date.localeCompare(a.date),
    );
    const profitMargin =
      totalRevenue > 0 ? Math.round((totalProfit / totalRevenue) * 100) : 0;

    // Growth comparison calculation
    let previousPeriodRevenue = 0;
    let previousPeriodProfit = 0;
    if (length > 0 && startDate) {
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - length);

      const prevOrders = await this.prisma.order.findMany({
        where: {
          bookshopId,
          status: 'COMPLETED',
          createdAt: {
            gte: prevStartDate,
            lt: startDate,
          },
        },
        include: {
          items: true,
        },
      });

      let prevCost = 0;
      for (const order of prevOrders) {
        previousPeriodRevenue += Number(order.totalAmount);
        for (const item of order.items) {
          prevCost += Number(item.costPriceSnapshot) * item.quantity;
        }
      }
      previousPeriodProfit = previousPeriodRevenue - prevCost;
    }

    const revenueGrowth =
      previousPeriodRevenue > 0
        ? Math.round(
            ((totalRevenue - previousPeriodRevenue) / previousPeriodRevenue) *
              100,
          )
        : 0;
    const profitGrowth =
      previousPeriodProfit > 0
        ? Math.round(
            ((totalProfit - previousPeriodProfit) / previousPeriodProfit) * 100,
          )
        : 0;

    return {
      summary: {
        totalRevenue: Math.round(totalRevenue),
        totalCost: Math.round(totalCost),
        totalProfit: Math.round(totalProfit),
        profitMargin,
        totalOrders: orders.length,
        revenueGrowth,
        profitGrowth,
      },
      dailyBreakdown,
    };
  }
}
