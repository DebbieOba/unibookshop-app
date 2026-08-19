import { Module } from '@nestjs/common';
import { ObjectStorageModule } from '../../integrations/object-storage/object-storage.module';
import { NotificationModule } from '../notification/notification.module';
import { BooksController } from './controllers/books.controller';
import { CategoriesController } from './controllers/categories.controller';
import { FavouritesController } from './controllers/favourites.controller';
import { RatingsController } from './controllers/ratings.controller';
import { PreOrdersController } from './controllers/pre-orders.controller';
import { BooksService } from './services/books.service';
import { CategoriesService } from './services/categories.service';
import { RatingsService } from './services/ratings.service';
import { FavouritesService } from './services/favourites.service';
import { StockService } from './services/stock.service';
import { BookLookupService } from './services/book-lookup.service';
import { CourseLookupService } from './services/course-lookup.service';
import { PreOrdersService } from './services/pre-orders.service';

@Module({
  // NotificationModule is a deliberate exception to Catalogue's usual
  // leaf-only dependency rule (backend-architecture.md §7) — BooksService
  // needs to notify pre-order reservers the moment a book becomes available,
  // which is intrinsic to the book-update operation itself, not something
  // that belongs behind Order/Admin's coordination layer. Notification stays
  // a pure leaf either way (still depends on nothing), so this adds no cycle.
  imports: [ObjectStorageModule, NotificationModule],
  controllers: [
    BooksController,
    CategoriesController,
    FavouritesController,
    RatingsController,
    PreOrdersController,
  ],
  providers: [
    BooksService,
    CategoriesService,
    RatingsService,
    FavouritesService,
    StockService,
    BookLookupService,
    CourseLookupService,
    PreOrdersService,
  ],
  exports: [StockService, BookLookupService, CourseLookupService],
})
export class CatalogueModule {}
