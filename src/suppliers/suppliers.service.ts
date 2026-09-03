import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreateSupplierBookingDto } from './dto/create-supplier-booking.dto';
import { UpdateSupplierBookingDto } from './dto/update-supplier-booking.dto';
import { CreateSupplierCommissionDto } from './dto/create-supplier-commission.dto';
import { UpdateSupplierCommissionDto } from './dto/update-supplier-commission.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------- Suppliers ----------------

  async create(dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: {
        name: dto.name,
        type: dto.type ?? 'other',
        contact_person: dto.contact_person,
        email: dto.email,
        phone: dto.phone,
        address: dto.address,
        country: dto.country,
        tax_number: dto.tax_number,
        commission_rate: dto.commission_rate ?? 0,
        payment_terms: dto.payment_terms,
        contract_start_date: dto.contract_start_date
          ? new Date(dto.contract_start_date)
          : undefined,
        contract_end_date: dto.contract_end_date
          ? new Date(dto.contract_end_date)
          : undefined,
        status: dto.status ?? 'pending',
        rating: dto.rating,
        notes: dto.notes,
      },
    });
  }

  async findAll() {
    return this.prisma.supplier.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            supplier_bookings: true,
            supplier_commissions: true,
          },
        },
      },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier with ID ${id} not found`);
    }
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto) {
    await this.findOne(id);
    return this.prisma.supplier.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.contact_person !== undefined && {
          contact_person: dto.contact_person,
        }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.address !== undefined && { address: dto.address }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.tax_number !== undefined && { tax_number: dto.tax_number }),
        ...(dto.commission_rate !== undefined && {
          commission_rate: dto.commission_rate,
        }),
        ...(dto.payment_terms !== undefined && {
          payment_terms: dto.payment_terms,
        }),
        ...(dto.contract_start_date !== undefined && {
          contract_start_date: new Date(dto.contract_start_date),
        }),
        ...(dto.contract_end_date !== undefined && {
          contract_end_date: new Date(dto.contract_end_date),
        }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.rating !== undefined && { rating: dto.rating }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
    });
  }

  async remove(id: string) {
    const supplier = await this.findOne(id);

    if (
      supplier._count.supplier_bookings > 0 ||
      supplier._count.supplier_commissions > 0
    ) {
      // Soft-terminate to preserve financial history
      return this.prisma.supplier.update({
        where: { id },
        data: { status: 'terminated' },
        select: { id: true, name: true, status: true },
      });
    }

    return this.prisma.supplier.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }

  // ---------------- SupplierBookings ----------------

  async createBooking(supplierId: string, dto: CreateSupplierBookingDto) {
    await this.findOne(supplierId);
    if (dto.supplier_id !== supplierId) {
      throw new BadRequestException(
        'supplier_id in body does not match the URL parameter',
      );
    }

    const rate =
      dto.commission_rate !== undefined
        ? dto.commission_rate
        : Number(
            (await this.prisma.supplier.findUnique({ where: { id: supplierId } }))
              ?.commission_rate ?? 0,
          );

    const commissionAmount =
      dto.commission_amount !== undefined
        ? dto.commission_amount
        : +((dto.booking_amount * rate) / 100).toFixed(2);

    return this.prisma.supplierBooking.create({
      data: {
        supplier_id: supplierId,
        booking_id: dto.booking_id,
        booking_type: dto.booking_type,
        booking_amount: dto.booking_amount,
        commission_rate: rate,
        commission_amount: commissionAmount,
      },
      include: { supplier: { select: { id: true, name: true } } },
    });
  }

  async findBookingsBySupplier(supplierId: string) {
    await this.findOne(supplierId);
    return this.prisma.supplierBooking.findMany({
      where: { supplier_id: supplierId },
      orderBy: { created_at: 'desc' },
      include: { supplier: { select: { id: true, name: true } } },
    });
  }

  async findOneBooking(id: string) {
    const b = await this.prisma.supplierBooking.findUnique({
      where: { id },
      include: { supplier: { select: { id: true, name: true } } },
    });
    if (!b) {
      throw new NotFoundException(`Supplier booking with ID ${id} not found`);
    }
    return b;
  }

  async updateBooking(id: string, dto: UpdateSupplierBookingDto) {
    await this.findOneBooking(id);
    const rate =
      dto.commission_rate !== undefined
        ? dto.commission_rate
        : undefined;
    const amount =
      dto.booking_amount !== undefined ? dto.booking_amount : undefined;

    let commissionAmount: number | undefined;
    if (dto.commission_amount !== undefined) {
      commissionAmount = dto.commission_amount;
    } else if (rate !== undefined && amount !== undefined) {
      commissionAmount = +((amount * rate) / 100).toFixed(2);
    }

    return this.prisma.supplierBooking.update({
      where: { id },
      data: {
        ...(dto.booking_id !== undefined && { booking_id: dto.booking_id }),
        ...(dto.booking_type !== undefined && {
          booking_type: dto.booking_type,
        }),
        ...(amount !== undefined && { booking_amount: amount }),
        ...(rate !== undefined && { commission_rate: rate }),
        ...(commissionAmount !== undefined && { commission_amount: commissionAmount }),
      },
      include: { supplier: { select: { id: true, name: true } } },
    });
  }

  async removeBooking(id: string) {
    await this.findOneBooking(id);
    return this.prisma.supplierBooking.delete({
      where: { id },
      select: { id: true, booking_id: true, booking_type: true },
    });
  }

  // ---------------- SupplierCommissions ----------------

  async createCommission(dto: CreateSupplierCommissionDto) {
    await this.findOne(dto.supplier_id);

    if (new Date(dto.period_end) < new Date(dto.period_start)) {
      throw new BadRequestException(
        'period_end must be on or after period_start',
      );
    }

    const balance = +(
      (dto.commission_amount ?? 0) - (dto.paid_amount ?? 0)
    ).toFixed(2);

    return this.prisma.supplierCommission.create({
      data: {
        supplier_id: dto.supplier_id,
        period_start: new Date(dto.period_start),
        period_end: new Date(dto.period_end),
        total_bookings: dto.total_bookings ?? 0,
        total_revenue: dto.total_revenue ?? 0,
        commission_rate: dto.commission_rate ?? 0,
        commission_amount: dto.commission_amount ?? 0,
        paid_amount: dto.paid_amount ?? 0,
        balance,
        status: dto.status ?? 'pending',
      },
      include: { supplier: { select: { id: true, name: true } } },
    });
  }

  async findCommissions(supplierId?: string) {
    return this.prisma.supplierCommission.findMany({
      where: supplierId ? { supplier_id: supplierId } : undefined,
      orderBy: { period_end: 'desc' },
      include: { supplier: { select: { id: true, name: true } } },
    });
  }

  async findOneCommission(id: string) {
    const c = await this.prisma.supplierCommission.findUnique({
      where: { id },
      include: { supplier: { select: { id: true, name: true } } },
    });
    if (!c) {
      throw new NotFoundException(`Supplier commission with ID ${id} not found`);
    }
    return c;
  }

  async updateCommission(id: string, dto: UpdateSupplierCommissionDto) {
    const current = await this.findOneCommission(id);

    const periodStart = dto.period_start
      ? new Date(dto.period_start)
      : current.period_start;
    const periodEnd = dto.period_end
      ? new Date(dto.period_end)
      : current.period_end;
    if (periodEnd < periodStart) {
      throw new BadRequestException(
        'period_end must be on or after period_start',
      );
    }

    const commissionAmount =
      dto.commission_amount !== undefined
        ? dto.commission_amount
        : Number(current.commission_amount);
    const paidAmount =
      dto.paid_amount !== undefined ? dto.paid_amount : Number(current.paid_amount);
    const balance = +(commissionAmount - paidAmount).toFixed(2);

    return this.prisma.supplierCommission.update({
      where: { id },
      data: {
        ...(dto.supplier_id !== undefined && { supplier_id: dto.supplier_id }),
        period_start: periodStart,
        period_end: periodEnd,
        ...(dto.total_bookings !== undefined && {
          total_bookings: dto.total_bookings,
        }),
        ...(dto.total_revenue !== undefined && {
          total_revenue: dto.total_revenue,
        }),
        ...(dto.commission_rate !== undefined && {
          commission_rate: dto.commission_rate,
        }),
        ...(dto.commission_amount !== undefined && {
          commission_amount: dto.commission_amount,
        }),
        ...(dto.paid_amount !== undefined && { paid_amount: dto.paid_amount }),
        balance,
        ...(dto.status !== undefined && { status: dto.status }),
      },
      include: { supplier: { select: { id: true, name: true } } },
    });
  }

  async updateCommissionStatus(id: string, status: string) {
    const valid = ['pending', 'approved', 'paid', 'disputed'];
    if (!valid.includes(status)) {
      throw new BadRequestException(
        `Invalid status '${status}'. Valid: ${valid.join(', ')}`,
      );
    }
    await this.findOneCommission(id);
    return this.prisma.supplierCommission.update({
      where: { id },
      data: { status },
      select: { id: true, status: true, balance: true },
    });
  }

  async removeCommission(id: string) {
    await this.findOneCommission(id);
    return this.prisma.supplierCommission.delete({
      where: { id },
      select: { id: true, supplier_id: true },
    });
  }
}