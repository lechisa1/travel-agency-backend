import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateResourceDto) {
    return this.prisma.resource.create({
      data: {
        name: dto.name,
        type: dto.type ?? 'other',
        status: dto.status ?? 'available',
      },
    });
  }

  async findAll(type?: string) {
    return this.prisma.resource.findMany({
      where: type ? { type } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const r = await this.prisma.resource.findUnique({ where: { id } });
    if (!r) {
      throw new NotFoundException(`Resource with ID ${id} not found`);
    }
    return r;
  }

  async update(id: string, dto: UpdateResourceDto) {
    await this.findOne(id);
    return this.prisma.resource.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.resource.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }
}