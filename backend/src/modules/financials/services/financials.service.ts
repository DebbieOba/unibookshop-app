import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';

@Injectable()
export class FinancialsService {
  constructor(private readonly prisma: PrismaService) {}

  private parseDates(startDate?: string, endDate?: string) {
    let start: Date | undefined;
    let end: Date | undefined;
    if (startDate) start = new Date(startDate);
    if (endDate) {
      end = new Date(endDate);
      end.setUTCHours(23, 59, 59, 999);
    }
    return { start, end };
  }

  async getDashboardData(bookshopId: string, startDate?: string, endDate?: string) {
    if (!bookshopId) return null;

    const bookshop = await this.prisma.bookshop.findUnique({
      where: { id: bookshopId },
    });
    if (!bookshop) return null;

    const { start, end } = this.parseDates(startDate, endDate);

    // 1. Fetch Orders (Sales)
    const ordersWhere: any = { bookshopId, status: 'COMPLETED' };
    if (start || end) {
      ordersWhere.createdAt = {};
      if (start) ordersWhere.createdAt.gte = start;
      if (end) ordersWhere.createdAt.lte = end;
    }

    const orders = await this.prisma.order.findMany({
      where: ordersWhere,
      include: { items: true },
      orderBy: { createdAt: 'asc' },
    });

    // 2. Fetch Refunds
    const refundsWhere: any = { bookshopId };
    if (start || end) {
      refundsWhere.createdAt = {};
      if (start) refundsWhere.createdAt.gte = start;
      if (end) refundsWhere.createdAt.lte = end;
    }
    const refunds = await this.prisma.refund.findMany({
      where: refundsWhere,
    });

    // 3. Fetch Expenses
    const expensesWhere: any = { bookshopId };
    if (start || end) {
      expensesWhere.date = {};
      if (start) expensesWhere.date.gte = start;
      if (end) expensesWhere.date.lte = end;
    }
    const expenses = await this.prisma.expense.findMany({
      where: expensesWhere,
    });

    // Calculations
    let totalRevenue = 0;
    let cogs = 0;
    let booksSold = 0;
    let totalDiscounts = 0;

    const bookStats = new Map<string, { title: string; copies: number; revenue: number; cost: number }>();
    const paymentMethods = new Map<string, { count: number; amount: number }>();

    for (const order of orders) {
      totalRevenue += Number(order.totalAmount);
      totalDiscounts += Number(order.discountAmount);

      // Payment method aggregation
      const pm = order.paymentProvider;
      const pmStats = paymentMethods.get(pm) || { count: 0, amount: 0 };
      pmStats.count += 1;
      pmStats.amount += Number(order.totalAmount);
      paymentMethods.set(pm, pmStats);

      for (const item of order.items) {
        const cost = Number(item.costPriceSnapshot) * item.quantity;
        const revenue = Number(item.unitPrice) * item.quantity; // Pre-discount unit revenue roughly
        cogs += cost;
        booksSold += item.quantity;

        const bStat = bookStats.get(item.bookId) || { title: item.titleSnapshot, copies: 0, revenue: 0, cost: 0 };
        bStat.copies += item.quantity;
        bStat.revenue += revenue;
        bStat.cost += cost;
        bookStats.set(item.bookId, bStat);
      }
    }

    const totalRefunds = refunds.reduce((sum, r) => sum + Number(r.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
    
    // Adjusted figures
    const netSales = totalRevenue - totalRefunds;
    const grossProfit = netSales - cogs;
    const netProfit = grossProfit - totalExpenses;

    // Expense Breakdown
    const expenseBreakdown = new Map<string, number>();
    for (const e of expenses) {
      const cat = e.category || 'Other';
      expenseBreakdown.set(cat, (expenseBreakdown.get(cat) || 0) + Number(e.amount));
    }

    // Chart Data
    const chartDataMap = new Map<string, { date: string; revenue: number; cost: number; profit: number }>();
    for (const order of orders) {
      const dateStr = order.createdAt.toISOString().split('T')[0];
      const rev = Number(order.totalAmount);
      const cost = order.items.reduce((sum, item) => sum + Number(item.costPriceSnapshot) * item.quantity, 0);
      
      const existing = chartDataMap.get(dateStr) || { date: dateStr, revenue: 0, cost: 0, profit: 0 };
      existing.revenue += rev;
      existing.cost += cost;
      existing.profit += (rev - cost);
      chartDataMap.set(dateStr, existing);
    }
    const chartData = Array.from(chartDataMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // Rankings
    const booksArr = Array.from(bookStats.values());
    const bestSellingBooks = [...booksArr].sort((a, b) => b.copies - a.copies).slice(0, 5);
    const mostProfitableBooks = [...booksArr]
      .map(b => ({ ...b, profit: b.revenue - b.cost, profitMargin: b.revenue > 0 ? ((b.revenue - b.cost) / b.revenue) * 100 : 0 }))
      .sort((a, b) => b.profit - a.profit).slice(0, 5);

    return {
      bookshopName: bookshop.name,
      summary: {
        totalRevenue: Math.round(totalRevenue),
        netSales: Math.round(netSales),
        cogs: Math.round(cogs),
        grossProfit: Math.round(grossProfit),
        totalExpenses: Math.round(totalExpenses),
        netProfit: Math.round(netProfit),
        totalRefunds: Math.round(totalRefunds),
        totalDiscounts: Math.round(totalDiscounts),
        booksSold,
        totalOrders: orders.length,
      },
      chartData,
      expenseBreakdown: Array.from(expenseBreakdown.entries()).map(([name, amount]) => ({ name, amount: Math.round(amount) })),
      paymentMethods: Array.from(paymentMethods.entries()).map(([method, data]) => ({ method, ...data, amount: Math.round(data.amount) })),
      bestSellingBooks,
      mostProfitableBooks,
      insights: [
        totalRevenue > 0 ? `Your store generated ₦${Math.round(totalRevenue).toLocaleString()} in revenue.` : 'No sales recorded yet.',
        bestSellingBooks.length > 0 ? `"${bestSellingBooks[0].title}" is your top-selling book by volume.` : '',
      ].filter(Boolean),
    };
  }

  async getTransactions(bookshopId: string, startDate?: string, endDate?: string) {
    if (!bookshopId) return [];
    const { start, end } = this.parseDates(startDate, endDate);

    // Fetch Orders, Refunds, Expenses and combine them
    const dateFilter = (field: string) => {
      const filter: any = {};
      if (start) filter.gte = start;
      if (end) filter.lte = end;
      return Object.keys(filter).length > 0 ? { [field]: filter } : {};
    };

    const [orders, refunds, expenses] = await Promise.all([
      this.prisma.order.findMany({
        where: { bookshopId, status: 'COMPLETED', ...dateFilter('createdAt') },
        include: { items: true },
      }),
      this.prisma.refund.findMany({
        where: { bookshopId, ...dateFilter('createdAt') },
      }),
      this.prisma.expense.findMany({
        where: { bookshopId, ...dateFilter('date') },
      }),
    ]);

    const transactions: { id: string; date: Date; type: string; description: string; amount: number }[] = [];

    for (const o of orders) {
      transactions.push({
        id: o.id,
        date: o.createdAt,
        type: 'SALE',
        description: o.items.map(i => `${i.titleSnapshot} × ${i.quantity}`).join(', '),
        amount: Number(o.totalAmount),
      });
    }

    for (const r of refunds) {
      transactions.push({
        id: r.id,
        date: r.createdAt,
        type: 'REFUND',
        description: `Refund: ${r.reason}`,
        amount: -Number(r.amount),
      });
    }

    for (const e of expenses) {
      transactions.push({
        id: e.id,
        date: e.date,
        type: 'EXPENSE',
        description: `Expense: ${e.description} (${e.category || 'Other'})`,
        amount: -Number(e.amount),
      });
    }

    return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async getInventoryValue(bookshopId: string) {
    if (!bookshopId) return null;

    const books = await this.prisma.book.findMany({
      where: { bookshopId },
      select: { stockQuantity: true, costPrice: true, price: true },
    });

    let totalCopies = 0;
    let costValue = 0;
    let salesValue = 0;

    for (const b of books) {
      totalCopies += b.stockQuantity;
      costValue += b.stockQuantity * Number(b.costPrice);
      salesValue += b.stockQuantity * Number(b.price);
    }

    return {
      totalTitles: books.length,
      totalCopies,
      inventoryCostValue: Math.round(costValue),
      potentialSalesValue: Math.round(salesValue),
      potentialGrossProfit: Math.round(salesValue - costValue),
    };
  }
}
