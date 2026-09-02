import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateAirlineDto } from './dto/create-airline.dto';
import { UpdateAirlineDto } from './dto/update-airline.dto';

@Injectable()
export class AirlineService {
  constructor(private prisma: PrismaService) {}

  async create(createAirlineDto: CreateAirlineDto) {
    const { name, code, logo_url } = createAirlineDto;
    const airline = await this.prisma.airline.create({
      data: {
        name,
        code,
        logo_url,
      },
    });
    return airline;
  }

  async findAll() {
    return this.prisma.airline.findMany();
  }

  async findOne(id: string) {
    const airline = await this.prisma.airline.findUnique({
      where: { id },
    });
    return airline;
  }

  async update(id: string, updateAirlineDto: UpdateAirlineDto) {
    const { name, code, logo_url } = updateAirlineDto;
    const airline = await this.prisma.airline.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(code && { code }),
        ...(logo_url && { logo_url }),
      },
    });
    return airline;
  }

  async remove(id: string) {
    const airline = await this.prisma.airline.delete({
      where: { id },
    });
    return airline;
  }
}
