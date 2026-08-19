import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private hasLoggedConnectionError = false;

  constructor(config: ConfigService) {
    super(config.getOrThrow<string>('REDIS_URL'), {
      // Cap reconnect attempts at 1/second instead of ioredis's default
      // rapid retry — avoids flooding the log when Redis isn't up yet.
      retryStrategy: () => 1000,
    });

    // ioredis emits 'error' on every failed connection attempt; without a
    // listener, Node treats each one as an unhandled error and dumps a full
    // stack trace. Log once, not per retry.
    this.on('error', (err) => {
      if (!this.hasLoggedConnectionError) {
        this.logger.warn(
          `Redis connection failed (${err.message}) — retrying in the background. ` +
            'Run `docker compose -f docker-compose.dev.yml up` if it\'s not running locally.',
        );
        this.hasLoggedConnectionError = true;
      }
    });

    this.on('connect', () => {
      this.hasLoggedConnectionError = false;
    });
  }

  async onModuleDestroy() {
    await this.quit();
  }
}
