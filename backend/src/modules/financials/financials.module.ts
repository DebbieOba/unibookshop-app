import { Module } from '@nestjs/common';
import { FinancialsController } from './controllers/financials.controller';
import { FinancialsService } from './services/financials.service';
import { ExpensesModule } from './expenses/expenses.module';

@Module({
  imports: [ExpensesModule],
  controllers: [FinancialsController],
  providers: [FinancialsService],
  exports: [FinancialsService],
})
export class FinancialsModule {}
