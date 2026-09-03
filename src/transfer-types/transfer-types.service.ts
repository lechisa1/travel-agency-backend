import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTransferTypeDto } from './dto/create-transfer-type.dto';
import { UpdateTransferTypeDto } from './dto/update-transfer-type.dto';

@Injectable()
export class TransferTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTransferTypeDto) {
    const existing = await this.prisma.transferType.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        `Transfer type '${dto.name}' already exists`,
      );
    }

    return this.prisma.transferType.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.transferType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const type = await this.prisma.transferType.findUnique({
      where: { id },
      include: { _count: { select: { transfers: true } } },
    });
    if (!type) {
      throw new NotFoundException(`Transfer type with ID ${id} not found`);
    }
    return type;
  }

  async update(id: string, dto: UpdateTransferTypeDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.transferType.findUnique({
        where: { name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Transfer type '${dto.name}' is already in use`,
        );
      }
    }

    return this.prisma.transferType.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const hasTransfers = await this.prisma.transfer.findFirst({
      where: { transfer_type_id: id },
    });
    if (hasTransfers) {
      throw new ConflictException(
        `Cannot delete transfer type: it is referenced by existing transfers`,
      );
    }

    return this.prisma.transferType.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }
}