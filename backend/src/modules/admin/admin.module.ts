import { Module } from '@nestjs/common';
import { CatalogueModule } from '../catalogue/catalogue.module';
import { NotificationModule } from '../notification/notification.module';

import { ApprovalsService } from './services/approvals.service';
import { DashboardService } from './services/dashboard.service';
import { InventoryService } from './services/inventory.service';
import { BookshopService } from './services/bookshop.service';

import { ApprovalsController } from './controllers/approvals.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { InventoryController } from './controllers/inventory.controller';
import { BookshopController } from './controllers/bookshop.controller';

@Module({
  imports: [CatalogueModule, NotificationModule],
  controllers: [
    ApprovalsController,
    DashboardController,
    InventoryController,
    BookshopController,
  ],
  providers: [
    ApprovalsService,
    DashboardService,
    InventoryService,
    BookshopService,
  ],
})
export class AdminModule {}
