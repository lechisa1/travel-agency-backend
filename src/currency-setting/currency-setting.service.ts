import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpsertCurrencySettingDto } from './dto/upsert-currency-setting.dto';

@Injectable()
export class CurrencySettingService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const setting = await this.prisma.currencySetting.findFirst();
    if (!setting) {
      throw new NotFoundException(
        'Currency setting has not been configured yet',
      );
    }
    return setting;
  }

  async upsert(dto: UpsertCurrencySettingDto) {
    const existing = await this.prisma.currencySetting.findFirst();
    if (existing) {
      return this.prisma.currencySetting.update({
        where: { id: existing.id },
        data: {
          ...dto,
          updated_at: new Date(),
        },
      });
    }
    return this.prisma.currencySetting.create({
      data: dto,
    });
  }

  async update(dto: UpsertCurrencySettingDto) {
    const existing = await this.prisma.currencySetting.findFirst();
    if (!existing) {
      throw new NotFoundException(
        'Currency setting has not been configured yet; use POST to create',
      );
    }
    return this.prisma.currencySetting.update({
      where: { id: existing.id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });
  }
}