import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateGroupBookingDto } from './dto/create-group-booking.dto';
import { UpdateGroupBookingDto } from './dto/update-group-booking.dto';
import { QueryGroupBookingDto } from './dto/query-group-booking.dto';
import { CreateGroupMemberInlineDto } from './dto/create-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class GroupBookingsService {
  constructor(private readonly prisma: PrismaService) {}

  private generateBookingReference(): string {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `GB-${randomHex}`;
  }

  async create(dto: CreateGroupBookingDto) {
    if (dto.leader_id) {
      const leader = await this.prisma.customer.findUnique({
        where: { id: dto.leader_id },
      });
      if (!leader) {
        throw new BadRequestException(
          `Leader (customer) with ID ${dto.leader_id} not found`,
        );
      }
    }

    if (dto.package_id) {
      const pkg = await this.prisma.package.findUnique({
        where: { id: dto.package_id },
      });
      if (!pkg) {
        throw new BadRequestException(
          `Package with ID ${dto.package_id} not found`,
        );
      }
    }

    // Pre-validate all member customer references up-front for a clean error
    if (dto.members?.length) {
      for (const m of dto.members) {
        if (m.customer_id) {
          const c = await this.prisma.customer.findUnique({
            where: { id: m.customer_id },
          });
          if (!c) {
            throw new BadRequestException(
              `Member customer with ID ${m.customer_id} not found`,
            );
          }
        }
      }
    }

    const packageBasePrice = dto.package_id
      ? Number(
          (
            await this.prisma.package.findUnique({
              where: { id: dto.package_id },
            })
          )?.base_price ?? 0,
        )
      : null;

    const totalPax = dto.total_pax ?? dto.members?.length ?? 0;
    const totalAmount =
      dto.total_amount !== undefined && dto.total_amount !== null
        ? dto.total_amount
        : packageBasePrice !== null
          ? +(packageBasePrice * totalPax).toFixed(2)
          : 0;

    let bookingReference = this.generateBookingReference();
    let isUnique = false;
    while (!isUnique) {
      const exists = await this.prisma.groupBooking.findUnique({
        where: { booking_reference: bookingReference },
      });
      if (!exists) {
        isUnique = true;
      } else {
        bookingReference = this.generateBookingReference();
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const booking = await tx.groupBooking.create({
        data: {
          booking_reference: bookingReference,
          group_name: dto.group_name,
          leader_id: dto.leader_id,
          package_id: dto.package_id,
          total_pax: totalPax,
          total_amount: totalAmount,
          status: dto.status ?? 'pending',
          travel_date: dto.travel_date ? new Date(dto.travel_date) : undefined,
        },
      });

      if (dto.members?.length) {
        await tx.groupMember.createMany({
          data: dto.members.map((m) => ({
            group_booking_id: booking.id,
            customer_id: m.customer_id,
            is_leader: m.is_leader ?? false,
          })),
        });
      }

      return tx.groupBooking.findUniqueOrThrow({
        where: { id: booking.id },
        include: this.defaultInclude(),
      });
    });
  }

  async findAll(query: QueryGroupBookingDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.GroupBookingWhereInput = {
      ...(query.leader_id && { leader_id: query.leader_id }),
      ...(query.package_id && { package_id: query.package_id }),
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
          { group_name: { contains: query.search, mode: 'insensitive' } },
          { booking_reference: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.groupBooking.count({ where }),
      this.prisma.groupBooking.findMany({
        where,
        take: limit,
        skip,
        orderBy: { created_at: 'desc' },
        include: {
          leader: { select: { id: true, full_name: true, phone: true } },
          package: { select: { id: true, name: true } },
          _count: { select: { group_members: true } },
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
    const booking = await this.prisma.groupBooking.findUnique({
      where: { id },
      include: this.defaultInclude(),
    });
    if (!booking) {
      throw new NotFoundException(`Group booking with ID ${id} not found`);
    }
    return booking;
  }

  async update(id: string, dto: UpdateGroupBookingDto) {
    const current = await this.findOne(id);

    if (dto.leader_id && dto.leader_id !== current.leader_id) {
      const leader = await this.prisma.customer.findUnique({
        where: { id: dto.leader_id },
      });
      if (!leader) {
        throw new BadRequestException(
          `Leader (customer) with ID ${dto.leader_id} not found`,
        );
      }
    }

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

    // Recompute total_amount when pax/package change (unless explicitly set)
    let totalAmount =
      dto.total_amount !== undefined
        ? dto.total_amount
        : Number(current.total_amount);

    if (dto.total_amount === undefined) {
      const packageId = dto.package_id ?? current.package_id;
      const totalPax = dto.total_pax ?? current.total_pax;
      if (packageId) {
        const pkg = await this.prisma.package.findUnique({
          where: { id: packageId },
        });
        if (pkg) {
          totalAmount = +(Number(pkg.base_price) * totalPax).toFixed(2);
        }
      }
    }

    return this.prisma.groupBooking.update({
      where: { id },
      data: {
        ...(dto.group_name !== undefined && { group_name: dto.group_name }),
        ...(dto.leader_id !== undefined && { leader_id: dto.leader_id }),
        ...(dto.package_id !== undefined && { package_id: dto.package_id }),
        ...(dto.total_pax !== undefined && { total_pax: dto.total_pax }),
        total_amount: totalAmount,
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.travel_date !== undefined && {
          travel_date: new Date(dto.travel_date),
        }),
      },
      include: this.defaultInclude(),
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

    return this.prisma.groupBooking.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        booking_reference: true,
        status: true,
      },
    });
  }

  // ---------------- Members ----------------

  async addMember(
    groupBookingId: string,
    dto: CreateGroupMemberInlineDto,
  ) {
    await this.findOne(groupBookingId);

    if (dto.customer_id) {
      const c = await this.prisma.customer.findUnique({
        where: { id: dto.customer_id },
      });
      if (!c) {
        throw new BadRequestException(
          `Member customer with ID ${dto.customer_id} not found`,
        );
      }
    }

    if (dto.is_leader) {
      await this.prisma.groupMember.updateMany({
        where: { group_booking_id: groupBookingId, is_leader: true },
        data: { is_leader: false },
      });
    }

    return this.prisma.groupMember.create({
      data: {
        group_booking_id: groupBookingId,
        customer_id: dto.customer_id,
        is_leader: dto.is_leader ?? false,
      },
      include: {
        customer: {
          select: { id: true, full_name: true, phone: true, email: true },
        },
      },
    });
  }

  async updateMember(memberId: string, dto: UpdateGroupMemberDto) {
    const member = await this.prisma.groupMember.findUnique({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException(`Group member with ID ${memberId} not found`);
    }

    if (dto.customer_id) {
      const c = await this.prisma.customer.findUnique({
        where: { id: dto.customer_id },
      });
      if (!c) {
        throw new BadRequestException(
          `Member customer with ID ${dto.customer_id} not found`,
        );
      }
    }

    if (dto.is_leader === true) {
      await this.prisma.groupMember.updateMany({
        where: {
          group_booking_id: member.group_booking_id,
          is_leader: true,
          NOT: { id: memberId },
        },
        data: { is_leader: false },
      });
    }

    return this.prisma.groupMember.update({
      where: { id: memberId },
      data: {
        ...(dto.customer_id !== undefined && {
          customer_id: dto.customer_id,
        }),
        ...(dto.is_leader !== undefined && { is_leader: dto.is_leader }),
      },
      include: {
        customer: {
          select: { id: true, full_name: true, phone: true, email: true },
        },
      },
    });
  }

  async removeMember(memberId: string) {
    const member = await this.prisma.groupMember.findUnique({
      where: { id: memberId },
    });
    if (!member) {
      throw new NotFoundException(`Group member with ID ${memberId} not found`);
    }

    const booking = await this.prisma.groupBooking.findUnique({
      where: { id: member.group_booking_id },
    });

    await this.prisma.groupMember.delete({ where: { id: memberId } });

    // Decrement total_pax if the booking is still editable
    if (booking && booking.total_pax > 0) {
      await this.prisma.groupBooking.update({
        where: { id: booking.id },
        data: { total_pax: { decrement: 1 } },
      });
    }

    return { id: memberId, group_booking_id: member.group_booking_id };
  }

  async remove(id: string) {
    await this.findOne(id);

    // GroupMember has no FK onDelete=Cascade — clean up manually
    await this.prisma.groupMember.deleteMany({
      where: { group_booking_id: id },
    });

    return this.prisma.groupBooking.delete({
      where: { id },
      select: { id: true, booking_reference: true, group_name: true },
    });
  }

  private defaultInclude() {
    const orderBy: Prisma.GroupMemberOrderByWithRelationInput[] = [
      { is_leader: 'desc' as Prisma.SortOrder },
      { created_at: 'asc' as Prisma.SortOrder },
    ];
    return {
      leader: {
        select: { id: true, full_name: true, phone: true, email: true },
      },
      package: {
        select: { id: true, name: true, base_price: true, duration_days: true },
      },
      group_members: {
        orderBy,
        include: {
          customer: {
            select: { id: true, full_name: true, phone: true, email: true },
          },
        },
      },
      _count: { select: { group_members: true } },
    };
  }
}