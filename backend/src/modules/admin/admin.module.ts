import { Module } from '@nestjs/common';
import { CatalogueModule } from '../catalogue/catalogue.module';
import { NotificationModule } from '../notification/notification.module';
import { SchoolsController } from './controllers/schools.controller';
import { DepartmentsController } from './controllers/departments.controller';
import { LevelsController } from './controllers/levels.controller';
import { ApprovalsController } from './controllers/approvals.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { InventoryController } from './controllers/inventory.controller';
import { SchoolsService } from './services/schools.service';
import { DepartmentsService } from './services/departments.service';
import { LevelsService } from './services/levels.service';
import { ApprovalsService } from './services/approvals.service';
import { DashboardService } from './services/dashboard.service';
import { InventoryService } from './services/inventory.service';

@Module({
  imports: [CatalogueModule, NotificationModule],
  controllers: [
    SchoolsController,
    DepartmentsController,
    LevelsController,
    ApprovalsController,
    DashboardController,
    InventoryController,
  ],
  providers: [
    SchoolsService,
    DepartmentsService,
    LevelsService,
    ApprovalsService,
    DashboardService,
    InventoryService,
  ],
})
export class AdminModule {}
