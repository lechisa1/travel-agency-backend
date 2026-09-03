import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateEmailTemplateDto } from './dto/create-email-template.dto';
import { UpdateEmailTemplateDto } from './dto/update-email-template.dto';

@Injectable()
export class EmailTemplatesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateEmailTemplateDto) {
    return this.prisma.emailTemplate.create({
      data: {
        name: dto.name,
        subject: dto.subject,
        body: dto.body,
        module: dto.module,
        is_active: dto.is_active ?? true,
      },
    });
  }

  async findAll(module?: string) {
    return this.prisma.emailTemplate.findMany({
      where: module ? { module } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const tpl = await this.prisma.emailTemplate.findUnique({ where: { id } });
    if (!tpl) {
      throw new NotFoundException(`Email template with ID ${id} not found`);
    }
    return tpl;
  }

  async update(id: string, dto: UpdateEmailTemplateDto) {
    await this.findOne(id);
    return this.prisma.emailTemplate.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.subject !== undefined && { subject: dto.subject }),
        ...(dto.body !== undefined && { body: dto.body }),
        ...(dto.module !== undefined && { module: dto.module }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.emailTemplate.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }
}