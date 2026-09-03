import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTaxRuleDto } from './dto/create-tax-rule.dto';
import { UpdateTaxRuleDto } from './dto/update-tax-rule.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TaxRulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTaxRuleDto) {
    if (dto.effective_from && dto.effective_to) {
      if (new Date(dto.effective_to) < new Date(dto.effective_from)) {
        throw new BadRequestException(
          'effective_to must be on or after effective_from',
        );
      }
    }

    return this.prisma.taxRule.create({
      data: {
        name: dto.name,
        rate: dto.rate,
        type: dto.type ?? 'percentage',
        applicable_to: dto.applicable_to ?? [],
        is_enabled: dto.is_enabled ?? true,
        effective_from: dto.effective_from
          ? new Date(dto.effective_from)
          : undefined,
        effective_to: dto.effective_to ? new Date(dto.effective_to) : undefined,
      },
    });
  }

  async findAll() {
    return this.prisma.taxRule.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async findOne(id: string) {
    const rule = await this.prisma.taxRule.findUnique({ where: { id } });
    if (!rule) {
      throw new NotFoundException(`Tax rule with ID ${id} not found`);
    }
    return rule;
  }

  async update(id: string, dto: UpdateTaxRuleDto) {
    await this.findOne(id);

    if (dto.effective_from && dto.effective_to) {
      if (new Date(dto.effective_to) < new Date(dto.effective_from)) {
        throw new BadRequestException(
          'effective_to must be on or after effective_from',
        );
      }
    }

    return this.prisma.taxRule.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.rate !== undefined && { rate: dto.rate }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.applicable_to !== undefined && {
          applicable_to: dto.applicable_to,
        }),
        ...(dto.is_enabled !== undefined && { is_enabled: dto.is_enabled }),
        ...(dto.effective_from !== undefined && {
          effective_from: new Date(dto.effective_from),
        }),
        ...(dto.effective_to !== undefined && {
          effective_to: new Date(dto.effective_to),
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.taxRule.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }
}