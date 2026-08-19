// Only these are importable by other modules — see backend-architecture.md §5.
export { StockService } from './services/stock.service';
export type { AdjustStockInput } from './services/stock.service';
export type { InventoryMovement, InventoryMovementType } from '@prisma/client';
export { BookLookupService } from './services/book-lookup.service';
export type { BookSnapshot } from './services/book-lookup.service';
export { CourseLookupService } from './services/course-lookup.service';
export type { SyllabusBook } from './services/course-lookup.service';
