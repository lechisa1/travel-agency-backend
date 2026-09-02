import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';
import { UpdateHotelBookingDto } from './dto/update-hotel-booking.dto';
import { QueryHotelBookingDto } from './dto/query-hotel-booking.dto';
import { Prisma } from '@prisma/client';

const NIGHTS_FLOOR = 1;

@Injectable()
export class HotelBookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateBookingReference(): string {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `HB-${randomHex}`;
  }

  private generateVoucherNumber(): string {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `VCH-${randomHex}`;
  }

  private computeNights(checkIn: Date, checkOut: Date): number {
    const ms = checkOut.getTime() - checkIn.getTime();
    const nights = Math.max(NIGHTS_FLOOR, Math.round(ms / (1000 * 60 * 60 * 24)));
    return nights;
  }

  async create(dto: CreateHotelBookingDto) {
    const checkIn = new Date(dto.check_in);
    const checkOut = new Date(dto.check_out);

    if (checkOut <= checkIn) {
      throw new BadRequestException('check_out must be after check_in');
    }

    if (dto.customer_id) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customer_id },
      });
      if (!customer) {
        throw new BadRequestException(
          `Customer with ID ${dto.customer_id} not found`,
        );
      }
    }

    if (dto.hotel_partner_id) {
      const partner = await this.prisma.hotelPartner.findUnique({
        where: { id: dto.hotel_partner_id },
      });
      if (!partner) {
        throw new BadRequestException(
          `Hotel partner with ID ${dto.hotel_partner_id} not found`,
        );
      }
    }

    if (dto.room_type_id) {
      const roomType = await this.prisma.roomType.findUnique({
        where: { id: dto.room_type_id },
      });
      if (!roomType) {
        throw new BadRequestException(
          `Room type with ID ${dto.room_type_id} not found`,
        );
      }
    }

    const nights = this.computeNights(checkIn, checkOut);
    const rooms = dto.rooms ?? 1;
    const total = +(nights * rooms * dto.rate_per_night).toFixed(2);

    // Generate unique booking reference
    let bookingReference = this.generateBookingReference();
    let isUnique = false;
    while (!isUnique) {
      const exists = await this.prisma.hotelBooking.findUnique({
        where: { booking_reference: bookingReference },
      });
      if (!exists) {
        isUnique = true;
      } else {
        bookingReference = this.generateBookingReference();
      }
    }

    return this.prisma.hotelBooking.create({
      data: {
        booking_reference: bookingReference,
        customer_id: dto.customer_id,
        hotel_partner_id: dto.hotel_partner_id,
        room_type_id: dto.room_type_id,
        check_in: checkIn,
        check_out: checkOut,
        rooms,
        rate_per_night: dto.rate_per_night,
        total,
        status: dto.status ?? 'tentative',
      },
      include: {
        customer: {
          select: { id: true, full_name: true, phone: true, email: true },
        },
        hotel_partner: { select: { id: true, name: true, location: true } },
        room_type: { select: { id: true, name: true, icon: true } },
      },
    });
  }

  async findAll(query: QueryHotelBookingDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.HotelBookingWhereInput = {
      ...(query.customer_id && { customer_id: query.customer_id }),
      ...(query.hotel_partner_id && {
        hotel_partner_id: query.hotel_partner_id,
      }),
      ...(query.room_type_id && { room_type_id: query.room_type_id }),
      ...(query.status && { status: query.status }),
      ...(query.from_date || query.to_date
        ? {
            check_in: {
              ...(query.from_date && { gte: new Date(query.from_date) }),
              ...(query.to_date && { lte: new Date(query.to_date) }),
            },
          }
        : {}),
      ...(query.search && {
        booking_reference: { contains: query.search, mode: 'insensitive' },
      }),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.hotelBooking.count({ where }),
      this.prisma.hotelBooking.findMany({
        where,
        take: limit,
        skip,
        orderBy: { created_at: 'desc' },
        include: {
          customer: { select: { id: true, full_name: true, phone: true } },
          hotel_partner: { select: { id: true, name: true } },
          room_type: { select: { id: true, name: true } },
          voucher: {
            select: { id: true, voucher_number: true, pdf_url: true },
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
    const booking = await this.prisma.hotelBooking.findUnique({
      where: { id },
      include: {
        customer: true,
        hotel_partner: true,
        room_type: true,
        voucher: true,
      },
    });
    if (!booking) {
      throw new NotFoundException(`Hotel booking with ID ${id} not found`);
    }
    return booking;
  }

  async update(id: string, dto: UpdateHotelBookingDto) {
    const current = await this.findOne(id);

    const checkIn = dto.check_in ? new Date(dto.check_in) : current.check_in;
    const checkOut = dto.check_out
      ? new Date(dto.check_out)
      : current.check_out;

    if (checkOut <= checkIn) {
      throw new BadRequestException('check_out must be after check_in');
    }

    if (dto.customer_id && dto.customer_id !== current.customer_id) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customer_id },
      });
      if (!customer) {
        throw new BadRequestException(
          `Customer with ID ${dto.customer_id} not found`,
        );
      }
    }

    if (dto.hotel_partner_id && dto.hotel_partner_id !== current.hotel_partner_id) {
      const partner = await this.prisma.hotelPartner.findUnique({
        where: { id: dto.hotel_partner_id },
      });
      if (!partner) {
        throw new BadRequestException(
          `Hotel partner with ID ${dto.hotel_partner_id} not found`,
        );
      }
    }

    if (dto.room_type_id && dto.room_type_id !== current.room_type_id) {
      const roomType = await this.prisma.roomType.findUnique({
        where: { id: dto.room_type_id },
      });
      if (!roomType) {
        throw new BadRequestException(
          `Room type with ID ${dto.room_type_id} not found`,
        );
      }
    }

    const nights = this.computeNights(checkIn, checkOut);
    const rooms = dto.rooms !== undefined ? dto.rooms : current.rooms;
    const rate =
      dto.rate_per_night !== undefined
        ? dto.rate_per_night
        : Number(current.rate_per_night);
    const total = +(nights * rooms * rate).toFixed(2);

    return this.prisma.hotelBooking.update({
      where: { id },
      data: {
        ...(dto.customer_id !== undefined && {
          customer_id: dto.customer_id,
        }),
        ...(dto.hotel_partner_id !== undefined && {
          hotel_partner_id: dto.hotel_partner_id,
        }),
        ...(dto.room_type_id !== undefined && {
          room_type_id: dto.room_type_id,
        }),
        check_in: checkIn,
        check_out: checkOut,
        rooms,
        rate_per_night: rate,
        total,
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: {
        customer: { select: { id: true, full_name: true } },
        hotel_partner: { select: { id: true, name: true } },
        room_type: { select: { id: true, name: true } },
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const valid = [
      'tentative',
      'confirmed',
      'checked_in',
      'checked_out',
      'cancelled',
      'no_show',
    ];
    if (!valid.includes(status)) {
      throw new BadRequestException(
        `Invalid status '${status}'. Valid: ${valid.join(', ')}`,
      );
    }
    await this.findOne(id);

    return this.prisma.hotelBooking.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        booking_reference: true,
        status: true,
        updated_at: true,
      },
    });
  }

  async issueVoucher(id: string, userId?: string) {
    const booking = await this.findOne(id);

    if (booking.voucher_issued) {
      throw new ConflictException(
        `Voucher already issued for booking ${booking.booking_reference}`,
      );
    }

    let voucherNumber = this.generateVoucherNumber();
    let unique = false;
    while (!unique) {
      const exists = await this.prisma.voucher.findUnique({
        where: { voucher_number: voucherNumber },
      });
      if (!exists) {
        unique = true;
      } else {
        voucherNumber = this.generateVoucherNumber();
      }
    }

    const voucher = await this.prisma.voucher.create({
      data: {
        booking_id: id,
        voucher_number: voucherNumber,
        issued_by: userId,
      },
    });

    await this.prisma.hotelBooking.update({
      where: { id },
      data: { voucher_issued: true, voucher_id: voucher.id },
    });

    return voucher;
  }

  async remove(id: string) {
    await this.findOne(id);

    // Voucher FK is unique on booking_id → unlink first
    await this.prisma.voucher.deleteMany({ where: { booking_id: id } });

    return this.prisma.hotelBooking.delete({
      where: { id },
      select: { id: true, booking_reference: true },
    });
  }
}