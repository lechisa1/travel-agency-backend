import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { QueryCustomerDto } from './dto/query-customer.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCustomerDto) {
    if (dto.passport_number) {
      const existingPassport = await this.prisma.customer.findUnique({
        where: { passport_number: dto.passport_number },
      });
      if (existingPassport) {
        throw new ConflictException('Passport number is already registered');
      }
    }

    return this.prisma.customer.create({
      data: {
        ...dto,
        date_of_birth: dto.date_of_birth
          ? new Date(dto.date_of_birth)
          : undefined,
        passport_issue_date: dto.passport_issue_date
          ? new Date(dto.passport_issue_date)
          : undefined,
        passport_expiry_date: dto.passport_expiry_date
          ? new Date(dto.passport_expiry_date)
          : undefined,
      },
    });
  }

  async findAll(query: QueryCustomerDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      ...(query.status && { status: query.status }),
      ...(query.nationality && { nationality: query.nationality }),
      ...(query.is_vip !== undefined && { is_vip: query.is_vip }),
      ...(query.search && {
        OR: [
          { full_name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
          { phone: { contains: query.search, mode: 'insensitive' } },
          { passport_number: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.customer.count({ where }),
      this.prisma.customer.findMany({
        where,
        take: limit,
        skip,
        orderBy: { created_at: 'desc' },
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
    const customer = await this.prisma.customer.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            flight_bookings: true,
            hotel_bookings: true,
            transfers: true,
            visa_applications: true,
            package_bookings: true,
            invoices: true,
            payments: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    await this.findOne(id); // Ensures customer exists

    if (dto.passport_number) {
      const existing = await this.prisma.customer.findUnique({
        where: { passport_number: dto.passport_number },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          'Passport number is already assigned to another customer',
        );
      }
    }

    return this.prisma.customer.update({
      where: { id },
      data: {
        ...dto,
        date_of_birth: dto.date_of_birth
          ? new Date(dto.date_of_birth)
          : undefined,
        passport_issue_date: dto.passport_issue_date
          ? new Date(dto.passport_issue_date)
          : undefined,
        passport_expiry_date: dto.passport_expiry_date
          ? new Date(dto.passport_expiry_date)
          : undefined,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.customer.delete({
      where: { id },
      select: { id: true, full_name: true },
    });
  }
  async checkPassportNumberUnique(
    passport_number: string,
    customerId?: string,
  ) {
    const existingCustomer = await this.prisma.customer.findUnique({
      where: { passport_number },
    });
    if (existingCustomer && existingCustomer.id !== customerId) {
      throw new ConflictException(
        'Passport number is already assigned to another customer',
      );
    }
  }

  async toggleVipStatus(id: string) {
    const customer = await this.findOne(id);
    return this.prisma.customer.update({
      where: { id },
      data: { is_vip: !customer.is_vip },
      select: { id: true, is_vip: true },
    });
  }
  async toggleStatus(id: string) {
    const customer = await this.findOne(id);
    return this.prisma.customer.update({
      where: { id },
      data: { status: customer.status === 'active' ? 'inactive' : 'active' },
      select: { id: true, status: true },
    });
  }
}
