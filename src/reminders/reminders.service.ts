import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReminderDto) {
    const event = await this.prisma.calendarEvent.findUnique({
      where: { id: dto.event_id },
    });
    if (!event) {
      throw new NotFoundException(
        `Calendar event with ID ${dto.event_id} not found`,
      );
    }

    return this.prisma.reminder.create({
      data: {
        event_id: dto.event_id,
        remind_at: new Date(dto.remind_at),
        method: dto.method ?? 'notification',
      },
    });
  }

  async findByEvent(eventId: string) {
    return this.prisma.reminder.findMany({
      where: { event_id: eventId },
      orderBy: { remind_at: 'asc' },
    });
  }

  async findOne(id: string) {
    const reminder = await this.prisma.reminder.findUnique({ where: { id } });
    if (!reminder) {
      throw new NotFoundException(`Reminder with ID ${id} not found`);
    }
    return reminder;
  }

  async update(id: string, dto: UpdateReminderDto) {
    await this.findOne(id);

    return this.prisma.reminder.update({
      where: { id },
      data: {
        ...(dto.remind_at !== undefined && {
          remind_at: new Date(dto.remind_at),
        }),
        ...(dto.method !== undefined && { method: dto.method }),
        ...(dto.event_id !== undefined && { event_id: dto.event_id }),
      },
    });
  }

  async markSent(id: string) {
    await this.findOne(id);
    return this.prisma.reminder.update({
      where: { id },
      data: { is_sent: true },
      select: { id: true, is_sent: true },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.reminder.delete({
      where: { id },
      select: { id: true },
    });
  }
}