import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { QueryCalendarEventDto } from './dto/query-calendar-event.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CalendarEventsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCalendarEventDto) {
    const start = new Date(dto.start_at);
    const end = dto.end_at ? new Date(dto.end_at) : null;

    if (end && end <= start) {
      throw new BadRequestException('end_at must be after start_at');
    }

    if (dto.type_id) {
      const type = await this.prisma.calendarEventType.findUnique({
        where: { id: dto.type_id },
      });
      if (!type) {
        throw new BadRequestException(
          `Calendar event type with ID ${dto.type_id} not found`,
        );
      }
    }

    if (dto.created_by) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.created_by },
      });
      if (!user) {
        throw new BadRequestException(
          `User with ID ${dto.created_by} not found`,
        );
      }
    }

    return this.prisma.calendarEvent.create({
      data: {
        title: dto.title,
        type_id: dto.type_id,
        start_at: start,
        end_at: end ?? undefined,
        all_day: dto.all_day ?? false,
        description: dto.description,
        location: dto.location,
        entity_type: dto.entity_type,
        entity_id: dto.entity_id,
        created_by: dto.created_by,
      },
      include: {
        type: { select: { id: true, name: true, color: true } },
        creator: {
          select: { id: true, full_name: true, email: true },
        },
        reminders: {
          select: {
            id: true,
            remind_at: true,
            method: true,
            is_sent: true,
          },
          orderBy: { remind_at: 'asc' },
        },
      },
    });
  }

  async findAll(query: QueryCalendarEventDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const where: Prisma.CalendarEventWhereInput = {
      ...(query.type_id && { type_id: query.type_id }),
      ...(query.entity_type && { entity_type: query.entity_type }),
      ...(query.entity_id && { entity_id: query.entity_id }),
      ...(query.created_by && { created_by: query.created_by }),
      ...(query.all_day !== undefined && query.all_day !== null
        ? { all_day: query.all_day }
        : {}),
      ...(query.from_date || query.to_date
        ? {
            start_at: {
              ...(query.from_date && { gte: new Date(query.from_date) }),
              ...(query.to_date && { lte: new Date(query.to_date) }),
            },
          }
        : {}),
      ...(query.search && {
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
          { location: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.calendarEvent.count({ where }),
      this.prisma.calendarEvent.findMany({
        where,
        take: limit,
        skip,
        orderBy: { start_at: 'asc' },
        include: {
          type: { select: { id: true, name: true, color: true } },
          _count: { select: { reminders: true } },
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id },
      include: {
        type: true,
        creator: {
          select: { id: true, full_name: true, email: true },
        },
        reminders: {
          orderBy: { remind_at: 'asc' },
        },
      },
    });
    if (!event) {
      throw new NotFoundException(`Calendar event with ID ${id} not found`);
    }
    return event;
  }

  async update(id: string, dto: UpdateCalendarEventDto) {
    const current = await this.findOne(id);

    const start = dto.start_at ? new Date(dto.start_at) : current.start_at;
    const end =
      dto.end_at !== undefined
        ? new Date(dto.end_at)
        : current.end_at;

    if (end && end <= start) {
      throw new BadRequestException('end_at must be after start_at');
    }

    if (dto.type_id) {
      const type = await this.prisma.calendarEventType.findUnique({
        where: { id: dto.type_id },
      });
      if (!type) {
        throw new BadRequestException(
          `Calendar event type with ID ${dto.type_id} not found`,
        );
      }
    }

    if (dto.created_by && dto.created_by !== current.created_by) {
      const user = await this.prisma.user.findUnique({
        where: { id: dto.created_by },
      });
      if (!user) {
        throw new BadRequestException(
          `User with ID ${dto.created_by} not found`,
        );
      }
    }

    return this.prisma.calendarEvent.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.type_id !== undefined && { type_id: dto.type_id }),
        start_at: start,
        ...(dto.end_at !== undefined && { end_at: end }),
        ...(dto.all_day !== undefined && { all_day: dto.all_day }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.entity_type !== undefined && { entity_type: dto.entity_type }),
        ...(dto.entity_id !== undefined && { entity_id: dto.entity_id }),
        ...(dto.created_by !== undefined && { created_by: dto.created_by }),
      },
      include: {
        type: { select: { id: true, name: true, color: true } },
        reminders: {
          select: {
            id: true,
            remind_at: true,
            method: true,
            is_sent: true,
          },
          orderBy: { remind_at: 'asc' },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.calendarEvent.delete({
      where: { id },
      select: { id: true, title: true, start_at: true },
    });
  }
}