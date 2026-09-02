import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateFlightBookingDto } from './dto/create-flight-booking.dto';
import { UpdateFlightBookingDto } from './dto/update-flight-booking.dto';
import { QueryFlightBookingDto } from './dto/query-flight-booking.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class FlightBookingsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a unique booking reference identifier (e.g., FB-8A3F9B)
   */
  private generateBookingReference(): string {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `FB-${randomHex}`;
  }

  async create(dto: CreateFlightBookingDto) {
    const existingPnr = await this.prisma.flightBooking.findUnique({
      where: { pnr: dto.pnr },
    });
    if (existingPnr) {
      throw new ConflictException(`PNR '${dto.pnr}' already exists`);
    }

    // Auto-compute total fare from inputs
    const fare = dto.fare ?? 0;
    const tax = dto.tax ?? 0;
    const serviceCharge = dto.service_charge ?? 0;
    const totalFare = fare + tax + serviceCharge;

    let bookingReference = this.generateBookingReference();
    // Guarantee uniqueness for booking_reference
    let isUnique = false;
    while (!isUnique) {
      const exists = await this.prisma.flightBooking.findUnique({
        where: { booking_reference: bookingReference },
      });
      if (!exists) {
        isUnique = true;
      } else {
        bookingReference = this.generateBookingReference();
      }
    }

    return this.prisma.flightBooking.create({
      data: {
        booking_reference: bookingReference,
        pnr: dto.pnr,
        customer_id: dto.customer_id,
        staff_id: dto.staff_id,
        airline_id: dto.airline_id,
        route_from: dto.route_from.toUpperCase(),
        route_to: dto.route_to.toUpperCase(),
        travel_date: new Date(dto.travel_date),
        class: dto.class ?? 'Economy',
        ticket_number: dto.ticket_number,
        fare,
        tax,
        service_charge: serviceCharge,
        total_fare: totalFare,
        status: dto.status ?? 'pending',
        booking_date: dto.booking_date ? new Date(dto.booking_date) : undefined,
      },
      include: {
        customer: {
          select: { id: true, full_name: true, email: true, phone: true },
        },
        staff: {
          select: { id: true, user: { select: { full_name: true } } },
        },
        airline: true,
      },
    });
  }

  async findAll(query: QueryFlightBookingDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.FlightBookingWhereInput = {
      ...(query.customer_id && { customer_id: query.customer_id }),
      ...(query.airline_id && { airline_id: query.airline_id }),
      ...(query.status && { status: query.status }),
      ...(query.from_date || query.to_date
        ? {
            travel_date: {
              ...(query.from_date && { gte: new Date(query.from_date) }),
              ...(query.to_date && { lte: new Date(query.to_date) }),
            },
          }
        : {}),
      ...(query.search && {
        OR: [
          { pnr: { contains: query.search, mode: 'insensitive' } },
          {
            booking_reference: { contains: query.search, mode: 'insensitive' },
          },
          { ticket_number: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.flightBooking.count({ where }),
      this.prisma.flightBooking.findMany({
        where,
        take: limit,
        skip,
        orderBy: { created_at: 'desc' },
        include: {
          customer: {
            select: { id: true, full_name: true, phone: true },
          },
          airline: {
            select: { id: true, name: true, code: true },
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
    const booking = await this.prisma.flightBooking.findUnique({
      where: { id },
      include: {
        customer: true,
        staff: {
          select: {
            id: true,
            user: { select: { full_name: true, email: true } },
          },
        },
        airline: true,
      },
    });

    if (!booking) {
      throw new NotFoundException(`Flight booking with ID ${id} not found`);
    }

    return booking;
  }

  async update(id: string, dto: UpdateFlightBookingDto) {
    const current = await this.findOne(id);

    if (dto.pnr && dto.pnr !== current.pnr) {
      const existingPnr = await this.prisma.flightBooking.findUnique({
        where: { pnr: dto.pnr },
      });
      if (existingPnr) {
        throw new ConflictException(`PNR '${dto.pnr}' is already in use`);
      }
    }

    // Recompute total fare if any financial numbers change
    const fare = dto.fare !== undefined ? dto.fare : Number(current.fare);
    const tax = dto.tax !== undefined ? dto.tax : Number(current.tax);
    const serviceCharge =
      dto.service_charge !== undefined
        ? dto.service_charge
        : Number(current.service_charge);
    const totalFare = fare + tax + serviceCharge;

    return this.prisma.flightBooking.update({
      where: { id },
      data: {
        ...dto,
        route_from: dto.route_from ? dto.route_from.toUpperCase() : undefined,
        route_to: dto.route_to ? dto.route_to.toUpperCase() : undefined,
        travel_date: dto.travel_date ? new Date(dto.travel_date) : undefined,
        booking_date: dto.booking_date ? new Date(dto.booking_date) : undefined,
        fare,
        tax,
        service_charge: serviceCharge,
        total_fare: totalFare,
      },
      include: {
        customer: {
          select: { id: true, full_name: true },
        },
        airline: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.flightBooking.delete({
      where: { id },
      select: { id: true, booking_reference: true, pnr: true },
    });
  }
}
