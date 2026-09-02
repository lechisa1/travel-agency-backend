import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreatePackageCategoryDto } from './dto/create-package-category.dto';
import { UpdatePackageCategoryDto } from './dto/update-package-category.dto';

@Injectable()
export class PackageCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePackageCategoryDto) {
    const existing = await this.prisma.packageCategory.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(
        `Package category '${dto.name}' already exists`,
      );
    }

    return this.prisma.packageCategory.create({
      data: {
        name: dto.name,
        description: dto.description,
      },
    });
  }

  async findAll() {
    return this.prisma.packageCategory.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.packageCategory.findUnique({
      where: { id },
      include: {
        packages: {
          select: { id: true, name: true, base_price: true, status: true },
          orderBy: { name: 'asc' },
        },
      },
    });
    if (!category) {
      throw new NotFoundException(
        `Package category with ID ${id} not found`,
      );
    }
    return category;
  }

  async update(id: string, dto: UpdatePackageCategoryDto) {
    await this.findOne(id);

    if (dto.name) {
      const existing = await this.prisma.packageCategory.findUnique({
        where: { name: dto.name },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException(
          `Package category '${dto.name}' is already in use`,
        );
      }
    }

    return this.prisma.packageCategory.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.description !== undefined && {
          description: dto.description,
        }),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    const hasPackages = await this.prisma.package.findFirst({
      where: { category_id: id },
    });
    if (hasPackages) {
      throw new ConflictException(
        `Cannot delete category: it is referenced by existing packages`,
      );
    }

    return this.prisma.packageCategory.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }
}