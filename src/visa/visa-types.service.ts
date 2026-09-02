import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateVisaTypeDto } from './dto/create-visa-type.dto';
import { UpdateVisaTypeDto } from './dto/update-visa-type.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VisaTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVisaTypeDto) {
    const existing = await this.prisma.visaType.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Visa type '${dto.name}' already exists`);
    }

    return this.prisma.visaType.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.visaType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const visaType = await this.prisma.visaType.findUnique({
      where: { id },
    });
    if (!visaType) {
      throw new NotFoundException(`Visa type with ID ${id} not found`);
    }
    return visaType;
  }

  async update(id: string, dto: UpdateVisaTypeDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.visaType.findUnique({
        where: { name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Visa type '${dto.name}' is already in use`,
        );
      }
    }

    return this.prisma.visaType.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const hasApplications = await this.prisma.visaApplication.findFirst({
      where: { visa_type_id: id },
    });
    if (hasApplications) {
      throw new ConflictException(
        `Cannot delete visa type: it is referenced by existing applications`,
      );
    }

    return this.prisma.visaType.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }
}