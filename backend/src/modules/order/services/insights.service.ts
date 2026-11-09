import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/postgres/prisma.service';
import { CourseLookupService } from '../../catalogue/catalogue.public-api';

export interface SavingsSummary {
  totalSaved: number;
  totalSpent: number;
  percentageSaved: number;
  orderCount: number;
}

export interface SyllabusCourseProgress {
  courseCode: string;
  courseTitle: string | null;
  requiredBookCount: number;
  ownedBookCount: number;
}

@Injectable()
export class InsightsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly courseLookup: CourseLookupService,
  ) {}

  /** Powers the Home "My Bookstore Savings" tracker — real numbers only, per BookdeckMobileDesignSystem.md. */
  async getSavingsSummary(userId: string): Promise<SavingsSummary> {
    const items = await this.prisma.orderItem.findMany({
      where: { order: { userId, status: 'COMPLETED' } },
      select: {
        unitPrice: true,
        compareAtPriceSnapshot: true,
        quantity: true,
        orderId: true,
      },
    });

    let totalSaved = 0;
    let totalSpent = 0;
    const orderIds = new Set<string>();
    for (const item of items) {
      orderIds.add(item.orderId);
      const unitPrice = Number(item.unitPrice);
      totalSpent += unitPrice * item.quantity;
      if (item.compareAtPriceSnapshot !== null) {
        const compareAt = Number(item.compareAtPriceSnapshot);
        totalSaved += Math.max(0, compareAt - unitPrice) * item.quantity;
      }
    }

    const retailEquivalent = totalSpent + totalSaved;
    const percentageSaved =
      retailEquivalent > 0
        ? Math.round((totalSaved / retailEquivalent) * 100)
        : 0;

    return {
      totalSaved: Math.round(totalSaved),
      totalSpent: Math.round(totalSpent),
      percentageSaved,
      orderCount: orderIds.size,
    };
  }

  /** Powers the Home "My Required Syllabus" tracker. */
  async getSyllabusProgress(userId: string): Promise<SyllabusCourseProgress[]> {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });
    return [];

  }
}
