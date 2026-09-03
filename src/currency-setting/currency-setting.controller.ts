import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrencySettingService } from './currency-setting.service';
import { UpsertCurrencySettingDto } from './dto/upsert-currency-setting.dto';

@ApiTags('Settings - Currency')
@ApiBearerAuth()
@Controller('settings/currency')
export class CurrencySettingController {
  constructor(
    private readonly currencySettingService: CurrencySettingService,
  ) {}

  @Get()
  get() {
    return this.currencySettingService.get();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  upsert(@Body() dto: UpsertCurrencySettingDto) {
    return this.currencySettingService.upsert(dto);
  }

  @Patch()
  update(@Body() dto: UpsertCurrencySettingDto) {
    return this.currencySettingService.update(dto);
  }
}