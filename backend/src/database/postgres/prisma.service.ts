import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === 'production'
          ? [
              { level: 'warn', emit: 'event' },
              { level: 'error', emit: 'event' },
            ]
          : [
              { level: 'query', emit: 'event' },
              { level: 'info', emit: 'event' },
              { level: 'warn', emit: 'event' },
              { level: 'error', emit: 'event' },
            ],
    });

    // Forward Prisma log events through NestJS Logger so they
    // appear in the same structured format as the rest of the app.
    (this as any).$on('warn', (e: { message: string }) =>
      this.logger.warn(e.message),
    );
    (this as any).$on('error', (e: { message: string }) =>
      this.logger.error(e.message),
    );
    if (process.env.NODE_ENV !== 'production') {
      (this as any).$on('info', (e: { message: string }) =>
        this.logger.log(e.message),
      );
      (this as any).$on('query', (e: { query: string; duration: number }) =>
        this.logger.debug(`[${e.duration}ms] ${e.query}`),
      );
    }
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
