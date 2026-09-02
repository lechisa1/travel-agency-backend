import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service'; // Adjust import path to your PrismaService
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;

// Reusable select scope to exclude password_hash automatically
const defaultUserSelect = Prisma.validator<Prisma.UserSelect>()({
  id: true,
  email: true,
  full_name: true,
  phone: true,
  avatar_url: true,
  is_active: true,
  last_login_at: true,
  created_at: true,
  updated_at: true,
  user_roles: {
    select: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
});

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);

    return this.prisma.user.create({
      data: {
        email: dto.email,
        password_hash,
        full_name: dto.full_name,
        phone: dto.phone,
        avatar_url: dto.avatar_url,
        user_roles: dto.role_ids?.length
          ? {
              create: dto.role_ids.map((role_id) => ({ role_id })),
            }
          : undefined,
      },
      select: defaultUserSelect,
    });
  }

  async findAll(query: QueryUserDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      ...(query.is_active !== undefined && { is_active: query.is_active }),
      ...(query.search && {
        OR: [
          { full_name: { contains: query.search, mode: 'insensitive' } },
          { email: { contains: query.search, mode: 'insensitive' } },
        ],
      }),
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        take: limit,
        skip,
        orderBy: { created_at: 'desc' },
        select: defaultUserSelect,
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
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        ...defaultUserSelect,
        user_roles: {
          select: {
            role: {
              select: {
                id: true,
                name: true,
                role_permissions: {
                  select: {
                    permission: {
                      select: {
                        id: true,
                        name: true,
                        module: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id); // Ensures existence

    const updateData: Prisma.UserUpdateInput = {
      email: dto.email,
      full_name: dto.full_name,
      phone: dto.phone,
      avatar_url: dto.avatar_url,
      is_active: dto.is_active,
    };

    if (dto.password) {
      updateData.password_hash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    }

    // Replace user roles if provided
    if (dto.role_ids !== undefined) {
      updateData.user_roles = {
        deleteMany: {},
        create: dto.role_ids.map((role_id) => ({ role_id })),
      };
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: defaultUserSelect,
    });
  }

  async remove(id: string, softDelete = true) {
    await this.findOne(id);

    if (softDelete) {
      return this.prisma.user.update({
        where: { id },
        data: { is_active: false },
        select: { id: true, is_active: true },
      });
    }

    return this.prisma.user.delete({
      where: { id },
      select: { id: true },
    });
  }
  async toggleActiveStatus(id: string) {
    const user = await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: { is_active: !user.is_active },
      select: { id: true, is_active: true },
    });
  }
  async assignRoles(userId: string, roleIds: string[]) {
    await this.findOne(userId); // Ensure user exists
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        user_roles: {
          deleteMany: {}, // Remove existing roles
          create: roleIds.map((role_id) => ({ role_id })), // Assign new roles
        },
      },
      select: defaultUserSelect,
    });
    // Implementation for assigning roles
  }
}
