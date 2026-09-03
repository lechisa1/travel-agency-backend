import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpsertEmailConfigDto } from './dto/upsert-email-config.dto';

@Injectable()
export class EmailConfigService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const config = await this.prisma.emailConfig.findFirst();
    if (!config) {
      throw new NotFoundException(
        'Email configuration has not been set up yet',
      );
    }
    // Never leak the secret over the wire
    const { api_key_encrypted, ...safe } = config;
    return { ...safe, has_api_key: !!api_key_encrypted };
  }

  async upsert(dto: UpsertEmailConfigDto) {
    const existing = await this.prisma.emailConfig.findFirst();
    if (existing) {
      return this.prisma.emailConfig.update({
        where: { id: existing.id },
        data: {
          ...dto,
          updated_at: new Date(),
        },
      });
    }
    return this.prisma.emailConfig.create({
      data: dto,
    });
  }

  async update(dto: UpsertEmailConfigDto) {
    const existing = await this.prisma.emailConfig.findFirst();
    if (!existing) {
      throw new NotFoundException(
        'Email configuration has not been set up yet; use POST to create',
      );
    }
    return this.prisma.emailConfig.update({
      where: { id: existing.id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });
  }
}