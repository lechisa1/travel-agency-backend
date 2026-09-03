import { Module } from '@nestjs/common';
import { TaxRulesService } from './tax-rules.service';
import { TaxRulesController } from './tax-rules.controller';

@Module({
  providers: [TaxRulesService],
  controllers: [TaxRulesController],
  exports: [TaxRulesService],
})
export class TaxRulesModule {}