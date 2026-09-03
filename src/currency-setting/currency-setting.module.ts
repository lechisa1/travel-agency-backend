import { Module } from '@nestjs/common';
import { CurrencySettingService } from './currency-setting.service';
import { CurrencySettingController } from './currency-setting.controller';

@Module({
  providers: [CurrencySettingService],
  controllers: [CurrencySettingController],
  exports: [CurrencySettingService],
})
export class CurrencySettingModule {}