import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSmsTemplateDto } from './dto/create-sms-template.dto';
import { UpdateSmsTemplateDto } from './dto/update-sms-template.dto';

@Injectable()
export class SmsTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateSmsTemplateDto) {
    return this.prisma.smsTemplate.create({
      data: {
        name: dto.name,
        body: dto.body,
        module: dto.module,
        is_active: dto.is_active ?? true,
      },
    });
  }

  async findAll(module?: string) {
    return this.prisma.smsTemplate.findMany({
      where: module ? { module } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const tpl = await this.prisma.smsTemplate.findUnique({ where: { id } });
    if (!tpl) {
      throw new NotFoundException(`SMS template with ID ${id} not found`);
    }
    return tpl;
  }

  async update(id: string, dto: UpdateSmsTemplateDto) {
    await this.findOne(id);
    return this.prisma.smsTemplate.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.body !== undefined && { body: dto.body }),
        ...(dto.module !== undefined && { module: dto.module }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.smsTemplate.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }
}