import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCalendarEventTypeDto } from './dto/create-calendar-event-type.dto';
import { UpdateCalendarEventTypeDto } from './dto/update-calendar-event-type.dto';

@Injectable()
export class CalendarEventTypesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCalendarEventTypeDto) {
    const existing = await this.prisma.calendarEventType.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        `Calendar event type '${dto.name}' already exists`,
      );
    }

    return this.prisma.calendarEventType.create({
      data: {
        name: dto.name,
        color: dto.color,
      },
    });
  }

  async findAll() {
    return this.prisma.calendarEventType.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const type = await this.prisma.calendarEventType.findUnique({
      where: { id },
      include: {
        _count: { select: { calendar_events: true } },
      },
    });
    if (!type) {
      throw new NotFoundException(
        `Calendar event type with ID ${id} not found`,
      );
    }
    return type;
  }

  async update(id: string, dto: UpdateCalendarEventTypeDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.calendarEventType.findUnique({
        where: { name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Calendar event type '${dto.name}' is already in use`,
        );
      }
    }

    return this.prisma.calendarEventType.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.color !== undefined && { color: dto.color }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const hasEvents = await this.prisma.calendarEvent.findFirst({
      where: { type_id: id },
    });
    if (hasEvents) {
      throw new ConflictException(
        `Cannot delete event type: it is referenced by existing events`,
      );
    }

    return this.prisma.calendarEventType.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }
}