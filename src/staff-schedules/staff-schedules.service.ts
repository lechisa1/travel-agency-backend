import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateStaffScheduleDto } from './dto/create-staff-schedule.dto';
import { UpdateStaffScheduleDto } from './dto/update-staff-schedule.dto';
import { QueryStaffScheduleDto } from './dto/query-staff-schedule.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class StaffSchedulesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateStaffScheduleDto) {
    const start = new Date(dto.start_at);
    const end = new Date(dto.end_at);

    if (end <= start) {
      throw new BadRequestException('end_at must be after start_at');
    }

    const staff = await this.prisma.staff.findUnique({
      where: { id: dto.staff_id },
    });
    if (!staff) {
      throw new BadRequestException(
        `Staff with ID ${dto.staff_id} not found`,
      );
    }

    return this.prisma.staffSchedule.create({
      data: {
        staff_id: dto.staff_id,
        start_at: start,
        end_at: end,
        shift_type: dto.shift_type,
        notes: dto.notes,
      },
      include: {
        staff: {
          select: {
            id: true,
            designation: true,
            user: { select: { full_name: true, email: true } },
          },
        },
      },
    });
  }

  async findAll(query: QueryStaffScheduleDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;
    const skip = (page - 1) * limit;

    const where: Prisma.StaffScheduleWhereInput = {
      ...(query.staff_id && { staff_id: query.staff_id }),
      ...(query.shift_type && { shift_type: query.shift_type }),
      ...(query.from_date || query.to_date
        ? {
            start_at: {
              ...(query.from_date && { gte: new Date(query.from_date) }),
              ...(query.to_date && { lte: new Date(query.to_date) }),
            },
          }
        : {}),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.staffSchedule.count({ where }),
      this.prisma.staffSchedule.findMany({
        where,
        take: limit,
        skip,
        orderBy: { start_at: 'asc' },
        include: {
          staff: {
            select: {
              id: true,
              designation: true,
              user: { select: { full_name: true } },
            },
          },
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
    const schedule = await this.prisma.staffSchedule.findUnique({
      where: { id },
      include: {
        staff: {
          select: {
            id: true,
            designation: true,
            user: { select: { full_name: true, email: true } },
          },
        },
      },
    });
    if (!schedule) {
      throw new NotFoundException(`Staff schedule with ID ${id} not found`);
    }
    return schedule;
  }

  async update(id: string, dto: UpdateStaffScheduleDto) {
    const current = await this.findOne(id);

    const start = dto.start_at ? new Date(dto.start_at) : current.start_at;
    const end = dto.end_at ? new Date(dto.end_at) : current.end_at;

    if (end <= start) {
      throw new BadRequestException('end_at must be after start_at');
    }

    if (dto.staff_id && dto.staff_id !== current.staff_id) {
      const staff = await this.prisma.staff.findUnique({
        where: { id: dto.staff_id },
      });
      if (!staff) {
        throw new BadRequestException(
          `Staff with ID ${dto.staff_id} not found`,
        );
      }
    }

    return this.prisma.staffSchedule.update({
      where: { id },
      data: {
        ...(dto.staff_id !== undefined && { staff_id: dto.staff_id }),
        start_at: start,
        end_at: end,
        ...(dto.shift_type !== undefined && { shift_type: dto.shift_type }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: {
        staff: {
          select: {
            id: true,
            user: { select: { full_name: true } },
          },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.staffSchedule.delete({
      where: { id },
      select: { id: true, staff_id: true, start_at: true },
    });
  }
}