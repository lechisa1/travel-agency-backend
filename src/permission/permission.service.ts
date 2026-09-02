import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from '@prisma/client';
import { PermissionQueryDto } from './dto/permission-query.dto';

@Injectable()
export class PermissionService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.permission.findMany({
      select: {
        id: true,
        name: true,
        module: true,
      },
    });
  }

  findOne(id: string) {
    return this.prisma.permission.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        module: true,
      },
    });
  }
}
