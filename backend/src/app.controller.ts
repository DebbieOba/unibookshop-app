import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import type { Response } from 'express';
import { Public } from './common/decorators/public.decorator';
import { PrismaService } from './database/postgres/prisma.service';
import { RedisService } from './database/redis/redis.service';

/** Bounds a dependency ping so a hung DB/Redis connection can't hang /health
 * itself — that would defeat the point of a liveness/readiness check. */
async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('timed out')), ms),
    ),
  ]);
}

@Controller()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /** Liveness only — does the process respond at all. Cheap, always 200. */
  @Public()
  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  /** Readiness — actually pings Postgres and Redis, so "is the backend
   * connected" can be answered from one request instead of guessing. Returns
   * 503 if either dependency is unreachable. */
  @Public()
  @Get('health/ready')
  async readiness(@Res({ passthrough: true }) res: Response) {
    const [database, redis] = await Promise.all([
      withTimeout(this.prisma.$queryRaw`SELECT 1`, 3000)
        .then(() => ({ status: 'ok' as const }))
        .catch((err) => ({ status: 'error' as const, message: err.message })),
      withTimeout(this.redis.ping(), 3000)
        .then(() => ({ status: 'ok' as const }))
        .catch((err) => ({ status: 'error' as const, message: err.message })),
    ]);

    const allOk = database.status === 'ok' && redis.status === 'ok';
    res.status(allOk ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE);
    return {
      status: allOk ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      dependencies: { database, redis },
    };
  }
}

// Testing kdkd
