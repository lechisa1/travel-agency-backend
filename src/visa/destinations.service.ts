import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDestinationDto } from './dto/create-destination.dto';
import { UpdateDestinationDto } from './dto/update-destination.dto';

@Injectable()
export class DestinationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateDestinationDto) {
    const existing = await this.prisma.destination.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Destination '${dto.name}' already exists`);
    }

    return this.prisma.destination.create({
      data: {
        name: dto.name,
        country: dto.country,
        embassy_city: dto.embassy_city,
      },
    });
  }

  async findAll() {
    return this.prisma.destination.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const destination = await this.prisma.destination.findUnique({
      where: { id },
    });
    if (!destination) {
      throw new NotFoundException(`Destination with ID ${id} not found`);
    }
    return destination;
  }

  async update(id: string, dto: UpdateDestinationDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.destination.findUnique({
        where: { name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Destination '${dto.name}' is already in use`,
        );
      }
    }

    return this.prisma.destination.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.embassy_city !== undefined && {
          embassy_city: dto.embassy_city,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const hasApplications = await this.prisma.visaApplication.findFirst({
      where: { destination_id: id },
    });
    if (hasApplications) {
      throw new ConflictException(
        `Cannot delete destination: it is referenced by existing applications`,
      );
    }

    return this.prisma.destination.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }
}