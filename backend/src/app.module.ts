import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { envValidationSchema } from './config/env.validation';
import { PrismaModule } from './database/postgres/prisma.module';
import { RedisModule } from './database/redis/redis.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { AccountStateGuard } from './common/guards/account-state.guard';
import { AppController } from './app.controller';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CatalogueModule } from './modules/catalogue/catalogue.module';
import { OrderModule } from './modules/order/order.module';
import { NotificationModule } from './modules/notification/notification.module';
import { AdminModule } from './modules/admin/admin.module';
import { PromotionsModule } from './modules/promotions/promotions.module';
import { ExchangeModule } from './modules/exchange/exchange.module';
import { ObjectStorageModule } from './integrations/object-storage/object-storage.module';
import { SisModule } from './integrations/sis/sis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
    }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
    PrismaModule,
    RedisModule,
    ObjectStorageModule,
    SisModule,
    AuthModule,
    UsersModule,
    CatalogueModule,
    OrderModule,
    NotificationModule,
    AdminModule,
    PromotionsModule,
    ExchangeModule,
  ],
  controllers: [AppController],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: AccountStateGuard },
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    { provide: APP_INTERCEPTOR, useClass: TimeoutInterceptor },
  ],
})
export class AppModule {}
