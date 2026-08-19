import { Module } from '@nestjs/common';
import { SisService } from './sis.service';

@Module({
  providers: [SisService],
  exports: [SisService],
})
export class SisModule {}
