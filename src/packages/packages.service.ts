import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { QueryPackageDto } from './dto/query-package.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PackagesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePackageDto) {
    if (dto.category_id) {
      const category = await this.prisma.packageCategory.findUnique({
        where: { id: dto.category_id },
      });
      if (!category) {
        throw new BadRequestException(
          `Package category with ID ${dto.category_id} not found`,
        );
      }
    }

    return this.prisma.package.create({
      data: {
        name: dto.name,
        category_id: dto.category_id,
        description: dto.description,
        inclusions: dto.inclusions,
        exclusions: dto.exclusions,
        base_price: dto.base_price,
        duration_days: dto.duration_days,
        max_pax: dto.max_pax,
        image_url: dto.image_url,
        status: dto.status ?? 'draft',
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });
  }

  async findAll(query: QueryPackageDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.PackageWhereInput = {
      ...(query.category_id && { category_id: query.category_id }),
      ...(query.status && { status: query.status }),
      ...((query.min_price !== undefined && query.min_price !== null) ||
      (query.max_price !== undefined && query.max_price !== null)
        ? {
            base_price: {
              ...(query.min_price !== undefined &&
                query.min_price !== null && { gte: query.min_price }),
              ...(query.max_price !== undefined &&
                query.max_price !== null && { lte: query.max_price }),
            },
          }
        : {}),
      ...(query.search && {
        OR: [
          { name: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.package.count({ where }),
      this.prisma.package.findMany({
        where,
        take: limit,
        skip,
        orderBy: { created_at: 'desc' },
        include: {
          category: { select: { id: true, name: true } },
          _count: { select: { package_bookings: true } },
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
    const pkg = await this.prisma.package.findUnique({
      where: { id },
      include: {
        category: { select: { id: true, name: true, description: true } },
        package_bookings: {
          select: {
            id: true,
            booking_reference: true,
            pax: true,
            total_amount: true,
            status: true,
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
        _count: { select: { package_bookings: true, group_bookings: true } },
      },
    });
    if (!pkg) {
      throw new NotFoundException(`Package with ID ${id} not found`);
    }
    return pkg;
  }

  async update(id: string, dto: UpdatePackageDto) {
    await this.findOne(id);

    if (dto.category_id) {
      const category = await this.prisma.packageCategory.findUnique({
        where: { id: dto.category_id },
      });
      if (!category) {
        throw new BadRequestException(
          `Package category with ID ${dto.category_id} not found`,
        );
      }
    }

    return this.prisma.package.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.category_id !== undefined && { category_id: dto.category_id }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.inclusions !== undefined && { inclusions: dto.inclusions }),
        ...(dto.exclusions !== undefined && { exclusions: dto.exclusions }),
        ...(dto.base_price !== undefined && { base_price: dto.base_price }),
        ...(dto.duration_days !== undefined && {
          duration_days: dto.duration_days,
        }),
        ...(dto.max_pax !== undefined && { max_pax: dto.max_pax }),
        ...(dto.image_url !== undefined && { image_url: dto.image_url }),
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: {
        category: { select: { id: true, name: true } },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const hasBookings = await this.prisma.packageBooking.findFirst({
      where: { package_id: id },
    });
    if (hasBookings) {
      // Archive instead of delete to preserve history
      return this.prisma.package.update({
        where: { id },
        data: { status: 'archived' },
        select: { id: true, name: true, status: true },
      });
    }

    return this.prisma.package.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }
}
