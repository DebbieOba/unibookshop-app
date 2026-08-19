import { Module } from '@nestjs/common';
import { ObjectStorageModule } from '../../integrations/object-storage/object-storage.module';
import { ListingsController } from './controllers/listings.controller';
import { ListingsService } from './services/listings.service';

@Module({
  imports: [ObjectStorageModule],
  controllers: [ListingsController],
  providers: [ListingsService],
})
export class ExchangeModule {}
