import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../database/postgres/prisma.service';

export interface SyllabusBook {
  id: string;
  title: string;
  price: number;
  courseCode: string;
  courseTitle: string | null;
}

/**
 * Read-only lookup over course-tagged books, scoped to a student's department/level.
 * Powers OrderModule's syllabus-progress endpoint (Home "Required Syllabus" tracker) —
 * kept in Catalogue since it owns Book.courseCode, per backend-architecture.md §5's
 * public-api boundary.
 */
@Injectable()
export class CourseLookupService {
  constructor(private readonly prisma: PrismaService) {}

  async listCourseBooksFor(
    departmentId?: string,
    level?: string,
  ): Promise<SyllabusBook[]> {
    if (!departmentId && !level) return [];

    const filters: Prisma.BookWhereInput[] = [{ courseCode: { not: null } }];
    if (departmentId)
      filters.push({
        attributes: { path: ['departmentId'], equals: departmentId },
      });
    if (level) filters.push({ attributes: { path: ['level'], equals: level } });

    const books = await this.prisma.book.findMany({
      where: { AND: filters },
      select: {
        id: true,
        title: true,
        price: true,
        courseCode: true,
        courseTitle: true,
      },
    });

    return books
      .filter((b): b is typeof b & { courseCode: string } => !!b.courseCode)
      .map((b) => ({
        id: b.id,
        title: b.title,
        price: Number(b.price),
        courseCode: b.courseCode,
        courseTitle: b.courseTitle,
      }));
  }
}
