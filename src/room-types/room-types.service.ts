import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateRoomTypeDto } from './dto/create-room-type.dto';
import { UpdateRoomTypeDto } from './dto/update-room-type.dto';

@Injectable()
export class RoomTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateRoomTypeDto) {
    const existing = await this.prisma.roomType.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Room type '${dto.name}' already exists`);
    }

    return this.prisma.roomType.create({
      data: {
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
      },
    });
  }

  async findAll() {
    return this.prisma.roomType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const roomType = await this.prisma.roomType.findUnique({
      where: { id },
    });
    if (!roomType) {
      throw new NotFoundException(`Room type with ID ${id} not found`);
    }
    return roomType;
  }

  async update(id: string, dto: UpdateRoomTypeDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.roomType.findUnique({
        where: { name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Room type '${dto.name}' is already in use`,
        );
      }
    }

    return this.prisma.roomType.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const hasBookings = await this.prisma.hotelBooking.findFirst({
      where: { room_type_id: id },
    });
    if (hasBookings) {
      throw new ConflictException(
        `Cannot delete room type: it is referenced by existing bookings`,
      );
    }

    return this.prisma.roomType.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }
}