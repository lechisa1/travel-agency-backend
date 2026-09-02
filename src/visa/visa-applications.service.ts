import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateVisaApplicationDto } from './dto/create-visa-application.dto';
import { UpdateVisaApplicationDto } from './dto/update-visa-application.dto';
import { QueryVisaApplicationDto } from './dto/query-visa-application.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class VisaApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a unique application number (e.g., VA-8A3F9B)
   */
  private generateApplicationNumber(): string {
    const randomHex = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `VA-${randomHex}`;
  }

  async create(dto: CreateVisaApplicationDto) {
    const customer = await this.prisma.customer.findUnique({
      where: { id: dto.customer_id },
    });
    if (!customer) {
      throw new BadRequestException(
        `Customer with ID ${dto.customer_id} not found`,
      );
    }

    if (dto.visa_type_id) {
      const visaType = await this.prisma.visaType.findUnique({
        where: { id: dto.visa_type_id },
      });
      if (!visaType) {
        throw new BadRequestException(
          `Visa type with ID ${dto.visa_type_id} not found`,
        );
      }
    }

    if (dto.destination_id) {
      const destination = await this.prisma.destination.findUnique({
        where: { id: dto.destination_id },
      });
      if (!destination) {
        throw new BadRequestException(
          `Destination with ID ${dto.destination_id} not found`,
        );
      }
    }

    if (dto.officer_id) {
      const officer = await this.prisma.staff.findUnique({
        where: { id: dto.officer_id },
      });
      if (!officer) {
        throw new BadRequestException(
          `Staff (officer) with ID ${dto.officer_id} not found`,
        );
      }
    }

    // Auto-compute total fee
    const visaFee = dto.visa_fee ?? 0;
    const serviceCharge = dto.service_charge ?? 0;
    const totalFee = visaFee + serviceCharge;

    // Generate unique application number
    let applicationNumber = this.generateApplicationNumber();
    let isUnique = false;
    while (!isUnique) {
      const exists = await this.prisma.visaApplication.findUnique({
        where: { application_number: applicationNumber },
      });
      if (!exists) {
        isUnique = true;
      } else {
        applicationNumber = this.generateApplicationNumber();
      }
    }

    return this.prisma.visaApplication.create({
      data: {
        application_number: applicationNumber,
        customer_id: dto.customer_id,
        visa_type_id: dto.visa_type_id,
        destination_id: dto.destination_id,
        officer_id: dto.officer_id,
        passport_number: dto.passport_number,
        nationality: dto.nationality,
        applied_date: dto.applied_date ? new Date(dto.applied_date) : undefined,
        status: dto.status ?? 'submitted',
        visa_fee: visaFee,
        service_charge: serviceCharge,
        total_fee: totalFee,
        notes: dto.notes,
      },
      include: {
        customer: {
          select: { id: true, full_name: true, phone: true, email: true },
        },
        visa_type: { select: { id: true, name: true } },
        destination: { select: { id: true, name: true, country: true } },
        officer: {
          select: {
            id: true,
            user: { select: { full_name: true, email: true } },
          },
        },
      },
    });
  }

  async findAll(query: QueryVisaApplicationDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.VisaApplicationWhereInput = {
      ...(query.customer_id && { customer_id: query.customer_id }),
      ...(query.visa_type_id && { visa_type_id: query.visa_type_id }),
      ...(query.destination_id && { destination_id: query.destination_id }),
      ...(query.officer_id && { officer_id: query.officer_id }),
      ...(query.status && { status: query.status }),
      ...(query.from_date || query.to_date
        ? {
            applied_date: {
              ...(query.from_date && { gte: new Date(query.from_date) }),
              ...(query.to_date && { lte: new Date(query.to_date) }),
            },
          }
        : {}),
      ...(query.search && {
        OR: [
          {
            application_number: { contains: query.search, mode: 'insensitive' },
          },
          { passport_number: { contains: query.search, mode: 'insensitive' } },
          { nationality: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.visaApplication.count({ where }),
      this.prisma.visaApplication.findMany({
        where,
        take: limit,
        skip,
        orderBy: { created_at: 'desc' },
        include: {
          customer: { select: { id: true, full_name: true, phone: true } },
          visa_type: { select: { id: true, name: true } },
          destination: { select: { id: true, name: true, country: true } },
          officer: {
            select: { id: true, user: { select: { full_name: true } } },
          },
          _count: {
            select: { visa_document_checklists: true },
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
    const application = await this.prisma.visaApplication.findUnique({
      where: { id },
      include: {
        customer: true,
        visa_type: true,
        destination: true,
        officer: {
          select: {
            id: true,
            user: { select: { full_name: true, email: true } },
          },
        },
        visa_document_checklists: {
          include: {
            document: {
              select: { id: true, title: true, file_url: true, file_type: true },
            },
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException(
        `Visa application with ID ${id} not found`,
      );
    }

    return application;
  }

  async update(id: string, dto: UpdateVisaApplicationDto) {
    const current = await this.findOne(id);

    if (dto.visa_type_id) {
      const visaType = await this.prisma.visaType.findUnique({
        where: { id: dto.visa_type_id },
      });
      if (!visaType) {
        throw new BadRequestException(
          `Visa type with ID ${dto.visa_type_id} not found`,
        );
      }
    }

    if (dto.destination_id) {
      const destination = await this.prisma.destination.findUnique({
        where: { id: dto.destination_id },
      });
      if (!destination) {
        throw new BadRequestException(
          `Destination with ID ${dto.destination_id} not found`,
        );
      }
    }

    if (dto.officer_id) {
      const officer = await this.prisma.staff.findUnique({
        where: { id: dto.officer_id },
      });
      if (!officer) {
        throw new BadRequestException(
          `Staff (officer) with ID ${dto.officer_id} not found`,
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

    // Recompute total fee if any financial fields changed
    const visaFee =
      dto.visa_fee !== undefined ? dto.visa_fee : Number(current.visa_fee);
    const serviceCharge =
      dto.service_charge !== undefined
        ? dto.service_charge
        : Number(current.service_charge);
    const totalFee = visaFee + serviceCharge;

    return this.prisma.visaApplication.update({
      where: { id },
      data: {
        ...(dto.customer_id !== undefined && {
          customer_id: dto.customer_id,
        }),
        ...(dto.visa_type_id !== undefined && {
          visa_type_id: dto.visa_type_id,
        }),
        ...(dto.destination_id !== undefined && {
          destination_id: dto.destination_id,
        }),
        ...(dto.officer_id !== undefined && { officer_id: dto.officer_id }),
        ...(dto.passport_number !== undefined && {
          passport_number: dto.passport_number,
        }),
        ...(dto.nationality !== undefined && {
          nationality: dto.nationality,
        }),
        ...(dto.applied_date !== undefined && {
          applied_date: new Date(dto.applied_date),
        }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.visa_fee !== undefined && { visa_fee: visaFee }),
        ...(dto.service_charge !== undefined && {
          service_charge: serviceCharge,
        }),
        total_fee: totalFee,
        ...(dto.notes !== undefined && { notes: dto.notes }),
      },
      include: {
        customer: { select: { id: true, full_name: true } },
        visa_type: { select: { id: true, name: true } },
        destination: { select: { id: true, name: true } },
        officer: {
          select: { id: true, user: { select: { full_name: true } } },
        },
      },
    });
  }

  async updateStatus(id: string, status: string) {
    const validStatuses = [
      'submitted',
      'under_review',
      'documents_pending',
      'approved',
      'rejected',
      'issued',
      'cancelled',
    ];

    if (!validStatuses.includes(status)) {
      throw new BadRequestException(
        `Invalid status '${status}'. Valid statuses: ${validStatuses.join(', ')}`,
      );
    }

    await this.findOne(id);

    return this.prisma.visaApplication.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        application_number: true,
        status: true,
        updated_at: true,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.visaApplication.delete({
      where: { id },
      select: {
        id: true,
        application_number: true,
        passport_number: true,
        status: true,
      },
    });
  }
}