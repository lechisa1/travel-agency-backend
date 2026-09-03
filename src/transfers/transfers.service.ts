import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { QueryTransferDto } from './dto/query-transfer.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransfersService {
  constructor(private readonly prisma: PrismaService) {}

  private generateBookingReference(): string {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `TR-${randomHex}`;
  }

  async create(dto: CreateTransferDto) {
    if (dto.customer_id) {
      const c = await this.prisma.customer.findUnique({
        where: { id: dto.customer_id },
      });
      if (!c) {
        throw new BadRequestException(
          `Customer with ID ${dto.customer_id} not found`,
        );
      }
    }

    if (dto.vehicle_id) {
      const v = await this.prisma.vehicle.findUnique({
        where: { id: dto.vehicle_id },
      });
      if (!v) {
        throw new BadRequestException(
          `Vehicle with ID ${dto.vehicle_id} not found`,
        );
      }
    }

    if (dto.driver_id) {
      const d = await this.prisma.driver.findUnique({
        where: { id: dto.driver_id },
      });
      if (!d) {
        throw new BadRequestException(
          `Driver with ID ${dto.driver_id} not found`,
        );
      }
    }

    if (dto.transfer_type_id) {
      const t = await this.prisma.transferType.findUnique({
        where: { id: dto.transfer_type_id },
      });
      if (!t) {
        throw new BadRequestException(
          `Transfer type with ID ${dto.transfer_type_id} not found`,
        );
      }
    }

    let bookingReference = this.generateBookingReference();
    let isUnique = false;
    while (!isUnique) {
      const exists = await this.prisma.transfer.findUnique({
        where: { booking_reference: bookingReference },
      });
      if (!exists) {
        isUnique = true;
      } else {
        bookingReference = this.generateBookingReference();
      }
    }

    return this.prisma.transfer.create({
      data: {
        booking_reference: bookingReference,
        customer_id: dto.customer_id,
        vehicle_id: dto.vehicle_id,
        driver_id: dto.driver_id,
        transfer_type_id: dto.transfer_type_id,
        pickup_location: dto.pickup_location,
        dropoff_location: dto.dropoff_location,
        date_time: new Date(dto.date_time),
        pax: dto.pax ?? 1,
        distance_km: dto.distance_km,
        luggage_count: dto.luggage_count ?? 0,
        cost: dto.cost,
        currency: dto.currency ?? 'OMR',
        payment_status: dto.payment_status ?? 'pending',
        status: dto.status ?? 'assigned',
        notes: dto.notes,
      },
      include: this.defaultInclude(),
    });
  }

  async findAll(query: QueryTransferDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.TransferWhereInput = {
      ...(query.customer_id && { customer_id: query.customer_id }),
      ...(query.vehicle_id && { vehicle_id: query.vehicle_id }),
      ...(query.driver_id && { driver_id: query.driver_id }),
      ...(query.transfer_type_id && {
        transfer_type_id: query.transfer_type_id,
      }),
      ...(query.status && { status: query.status }),
      ...(query.payment_status && { payment_status: query.payment_status }),
      ...(query.from_date || query.to_date
        ? {
            date_time: {
              ...(query.from_date && { gte: new Date(query.from_date) }),
              ...(query.to_date && { lte: new Date(query.to_date) }),
            },
          }
        : {}),
      ...(query.search && {
        OR: [
          { booking_reference: { contains: query.search, mode: 'insensitive' } },
          { pickup_location: { contains: query.search, mode: 'insensitive' } },
          {
            dropoff_location: { contains: query.search, mode: 'insensitive' },
          },
        ],
      }),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.transfer.count({ where }),
      this.prisma.transfer.findMany({
        where,
        take: limit,
        skip,
        orderBy: { date_time: 'asc' },
        include: this.listInclude(),
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
    const transfer = await this.prisma.transfer.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });
    if (!transfer) {
      throw new NotFoundException(`Transfer with ID ${id} not found`);
    }
    return transfer;
  }

  async update(id: string, dto: UpdateTransferDto) {
    const current = await this.findOne(id);

    if (dto.customer_id && dto.customer_id !== current.customer_id) {
      const c = await this.prisma.customer.findUnique({
        where: { id: dto.customer_id },
      });
      if (!c) {
        throw new BadRequestException(
          `Customer with ID ${dto.customer_id} not found`,
        );
      }
    }

    if (dto.vehicle_id && dto.vehicle_id !== current.vehicle_id) {
      const v = await this.prisma.vehicle.findUnique({
        where: { id: dto.vehicle_id },
      });
      if (!v) {
        throw new BadRequestException(
          `Vehicle with ID ${dto.vehicle_id} not found`,
        );
      }
    }

    if (dto.driver_id && dto.driver_id !== current.driver_id) {
      const d = await this.prisma.driver.findUnique({
        where: { id: dto.driver_id },
      });
      if (!d) {
        throw new BadRequestException(
          `Driver with ID ${dto.driver_id} not found`,
        );
      }
    }

    if (dto.transfer_type_id && dto.transfer_type_id !== current.transfer_type_id) {
      const t = await this.prisma.transferType.findUnique({
        where: { id: dto.transfer_type_id },
      });
      if (!t) {
        throw new BadRequestException(
          `Transfer type with ID ${dto.transfer_type_id} not found`,
        );
      }
    }

    return this.prisma.transfer.update({
      where: { id },
      data: {
        ...(dto.customer_id !== undefined && { customer_id: dto.customer_id }),
        ...(dto.vehicle_id !== undefined && { vehicle_id: dto.vehicle_id }),
        ...(dto.driver_id !== undefined && { driver_id: dto.driver_id }),
        ...(dto.transfer_type_id !== undefined && {
          transfer_type_id: dto.transfer_type_id,
        }),
        ...(dto.pickup_location !== undefined && {
          pickup_location: dto.pickup_location,
        }),
        ...(dto.dropoff_location !== undefined && {
          dropoff_location: dto.dropoff_location,
        }),
        ...(dto.date_time !== undefined && {
          date_time: new Date(dto.date_time),
        }),
        ...(dto.pax !== undefined && { pax: dto.pax }),
        ...(dto.distance_km !== undefined && { distance_km: dto.distance_km }),
        ...(dto.luggage_count !== undefined && {
          luggage_count: dto.luggage_count,
        }),
        ...(dto.cost !== undefined && { cost: dto.cost }),
        ...(dto.currency !== undefined && { currency: dto.currency }),
        ...(dto.payment_status !== undefined && {
          payment_status: dto.payment_status,
        }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: this.defaultInclude(),
    });
  }

  async updateStatus(id: string, status: string) {
    const valid = ['assigned', 'in_progress', 'completed', 'cancelled', 'no_show'];
    if (!valid.includes(status)) {
      throw new BadRequestException(
        `Invalid status '${status}'. Valid: ${valid.join(', ')}`,
      );
    }
    await this.findOne(id);

    return this.prisma.transfer.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        booking_reference: true,
        status: true,
      },
    });
  }

  async updatePaymentStatus(id: string, paymentStatus: string) {
    const valid = ['pending', 'partial', 'paid', 'refunded'];
    if (!valid.includes(paymentStatus)) {
      throw new BadRequestException(
        `Invalid payment_status '${paymentStatus}'. Valid: ${valid.join(', ')}`,
      );
    }
    await this.findOne(id);

    return this.prisma.transfer.update({
      where: { id },
      data: { payment_status: paymentStatus },
      select: {
        id: true,
        booking_reference: true,
        payment_status: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.transfer.delete({
      where: { id },
      select: {
        id: true,
        booking_reference: true,
        pickup_location: true,
        dropoff_location: true,
      },
    });
  }

  private defaultInclude() {
    return {
      customer: {
        select: { id: true, full_name: true, phone: true, email: true },
      },
      vehicle: {
        select: {
          id: true,
          plate_number: true,
          model: true,
          type: true,
          capacity: true,
        },
      },
      driver: {
        select: { id: true, full_name: true, phone: true, rating: true },
      },
      transfer_type: { select: { id: true, name: true } },
    };
  }

  private listInclude() {
    return {
      customer: { select: { id: true, full_name: true, phone: true } },
      vehicle: { select: { id: true, plate_number: true, model: true } },
      driver: { select: { id: true, full_name: true } },
      transfer_type: { select: { id: true, name: true } },
    };
  }
}