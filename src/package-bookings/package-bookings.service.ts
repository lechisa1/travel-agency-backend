import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePackageBookingDto } from './dto/create-package-booking.dto';
import { UpdatePackageBookingDto } from './dto/update-package-booking.dto';
import { QueryPackageBookingDto } from './dto/query-package-booking.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PackageBookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateBookingReference(): string {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `PB-${randomHex}`;
  }

  async create(dto: CreatePackageBookingDto) {
    let packageBasePrice: number | null = null;
    let packageMaxPax: number | null = null;

    if (dto.package_id) {
      const pkg = await this.prisma.package.findUnique({
        where: { id: dto.package_id },
      });
      if (!pkg) {
        throw new BadRequestException(
          `Package with ID ${dto.package_id} not found`,
        );
      }
      packageBasePrice = Number(pkg.base_price);
      packageMaxPax = pkg.max_pax ?? null;

      if (packageMaxPax !== null && dto.pax > packageMaxPax) {
        throw new BadRequestException(
          `pax (${dto.pax}) exceeds package max_pax (${packageMaxPax})`,
        );
      }
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

    // Auto-compute total if not provided
    const totalAmount =
      dto.total_amount !== undefined && dto.total_amount !== null
        ? dto.total_amount
        : packageBasePrice !== null
          ? +(packageBasePrice * dto.pax).toFixed(2)
          : 0;

    let bookingReference = this.generateBookingReference();
    let isUnique = false;
    while (!isUnique) {
      const exists = await this.prisma.packageBooking.findUnique({
        where: { booking_reference: bookingReference },
      });
      if (!exists) {
        isUnique = true;
      } else {
        bookingReference = this.generateBookingReference();
      }
    }

    return this.prisma.packageBooking.create({
      data: {
        booking_reference: bookingReference,
        package_id: dto.package_id,
        customer_id: dto.customer_id,
        pax: dto.pax,
        total_amount: totalAmount,
        status: dto.status ?? 'pending',
        travel_date: dto.travel_date ? new Date(dto.travel_date) : undefined,
      },
      include: {
        package: { select: { id: true, name: true, base_price: true } },
        customer: { select: { id: true, full_name: true, phone: true } },
      },
    });
  }

  async findAll(query: QueryPackageBookingDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PackageBookingWhereInput = {
      ...(query.package_id && { package_id: query.package_id }),
      ...(query.customer_id && { customer_id: query.customer_id }),
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
        booking_reference: { contains: query.search, mode: 'insensitive' },
      }),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.packageBooking.count({ where }),
      this.prisma.packageBooking.findMany({
        where,
        take: limit,
        skip,
        orderBy: { created_at: 'desc' },
        include: {
          package: { select: { id: true, name: true } },
          customer: { select: { id: true, full_name: true } },
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
    const booking = await this.prisma.packageBooking.findUnique({
      where: { id },
      include: {
        package: true,
        customer: true,
      },
    });
    if (!booking) {
      throw new NotFoundException(
        `Package booking with ID ${id} not found`,
      );
    }
    return booking;
  }

  async update(id: string, dto: UpdatePackageBookingDto) {
    const current = await this.findOne(id);

    if (dto.package_id && dto.package_id !== current.package_id) {
      const pkg = await this.prisma.package.findUnique({
        where: { id: dto.package_id },
      });
      if (!pkg) {
        throw new BadRequestException(
          `Package with ID ${dto.package_id} not found`,
        );
      }
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

    const newPax = dto.pax !== undefined ? dto.pax : current.pax;
    let totalAmount =
      dto.total_amount !== undefined ? dto.total_amount : Number(current.total_amount);

    // Auto-recompute when pax changes but total_amount wasn't explicitly set
    if (
      dto.total_amount === undefined &&
      (dto.package_id !== undefined || dto.pax !== undefined)
    ) {
      const packageId = dto.package_id ?? current.package_id;
      if (packageId) {
        const pkg = await this.prisma.package.findUnique({
          where: { id: packageId },
        });
        if (pkg) {
          totalAmount = +(Number(pkg.base_price) * newPax).toFixed(2);
          if (pkg.max_pax !== null && newPax > pkg.max_pax) {
            throw new BadRequestException(
              `pax (${newPax}) exceeds package max_pax (${pkg.max_pax})`,
            );
          }
        }
      }
    }

    return this.prisma.packageBooking.update({
      where: { id },
      data: {
        ...(dto.package_id !== undefined && { package_id: dto.package_id }),
        ...(dto.customer_id !== undefined && { customer_id: dto.customer_id }),
        ...(dto.pax !== undefined && { pax: newPax }),
        total_amount: totalAmount,
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.travel_date !== undefined && {
          travel_date: new Date(dto.travel_date),
        }),
      },
      include: {
        package: { select: { id: true, name: true } },
        customer: { select: { id: true, full_name: true } },
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const valid = ['pending', 'confirmed', 'cancelled', 'completed'];
    if (!valid.includes(status)) {
      throw new BadRequestException(
        `Invalid status '${status}'. Valid: ${valid.join(', ')}`,
      );
    }
    await this.findOne(id);

    return this.prisma.packageBooking.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        booking_reference: true,
        status: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.packageBooking.delete({
      where: { id },
      select: { id: true, booking_reference: true },
    });
  }
}