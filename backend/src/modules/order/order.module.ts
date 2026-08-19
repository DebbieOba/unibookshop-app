import { Module } from '@nestjs/common';
import { CatalogueModule } from '../catalogue/catalogue.module';
import { NotificationModule } from '../notification/notification.module';
import { PromotionsModule } from '../promotions/promotions.module';
import { PaymentsModule } from '../../integrations/payments/payments.module';
import { CartController } from './controllers/cart.controller';
import { OrdersController } from './controllers/orders.controller';
import { PaymentsWebhookController } from './controllers/payments-webhook.controller';
import { CartService } from './services/cart.service';
import { OrdersService } from './services/orders.service';
import { CheckoutService } from './services/checkout.service';
import { InsightsService } from './services/insights.service';

@Module({
  imports: [CatalogueModule, NotificationModule, PromotionsModule, PaymentsModule],
  controllers: [CartController, OrdersController, PaymentsWebhookController],
  providers: [CartService, OrdersService, CheckoutService, InsightsService],
})
export class OrderModule {}
