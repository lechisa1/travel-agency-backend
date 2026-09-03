import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpsertCompanyProfileDto } from './dto/upsert-company-profile.dto';

@Injectable()
export class CompanyProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async get() {
    const profile = await this.prisma.companyProfile.findFirst();
    if (!profile) {
      throw new NotFoundException(
        'Company profile has not been configured yet',
      );
    }
    return profile;
  }

  async upsert(dto: UpsertCompanyProfileDto) {
    const existing = await this.prisma.companyProfile.findFirst();
    if (existing) {
      return this.prisma.companyProfile.update({
        where: { id: existing.id },
        data: {
          ...dto,
          updated_at: new Date(),
        },
      });
    }
    return this.prisma.companyProfile.create({
      data: dto,
    });
  }

  async update(dto: UpsertCompanyProfileDto) {
    const existing = await this.prisma.companyProfile.findFirst();
    if (!existing) {
      throw new NotFoundException(
        'Company profile has not been configured yet; use POST to create',
      );
    }
    return this.prisma.companyProfile.update({
      where: { id: existing.id },
      data: {
        ...dto,
        updated_at: new Date(),
      },
    });
  }
}