import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateHotelPartnerDto } from './dto/create-hotel-partner.dto';
import { UpdateHotelPartnerDto } from './dto/update-hotel-partner.dto';

@Injectable()
export class HotelPartnersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateHotelPartnerDto) {
    return this.prisma.hotelPartner.create({
      data: {
        name: dto.name,
        location: dto.location,
        rating: dto.rating,
        reviews_count: dto.reviews_count ?? 0,
        amenities: dto.amenities,
        email: dto.email,
        phone: dto.phone,
        website: dto.website,
        is_active: dto.is_active ?? true,
      },
    });
  }

  async findAll() {
    return this.prisma.hotelPartner.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const partner = await this.prisma.hotelPartner.findUnique({
      where: { id },
      include: {
        hotel_bookings: {
          select: {
            id: true,
            booking_reference: true,
            check_in: true,
            check_out: true,
            status: true,
          },
          orderBy: { created_at: 'desc' },
          take: 10,
        },
        _count: { select: { hotel_bookings: true } },
      },
    });
    if (!partner) {
      throw new NotFoundException(`Hotel partner with ID ${id} not found`);
    }
    return partner;
  }

  async update(id: string, dto: UpdateHotelPartnerDto) {
    await this.findOne(id);

    return this.prisma.hotelPartner.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.rating !== undefined && { rating: dto.rating }),
        ...(dto.reviews_count !== undefined && {
          reviews_count: dto.reviews_count,
        }),
        ...(dto.amenities !== undefined && { amenities: dto.amenities }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.website !== undefined && { website: dto.website }),
        ...(dto.is_active !== undefined && { is_active: dto.is_active }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const hasBookings = await this.prisma.hotelBooking.findFirst({
      where: { hotel_partner_id: id },
    });
    if (hasBookings) {
      // soft-disable instead of hard-delete to preserve history
      return this.prisma.hotelPartner.update({
        where: { id },
        data: { is_active: false },
        select: { id: true, name: true, is_active: true },
      });
    }

    return this.prisma.hotelPartner.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }
}