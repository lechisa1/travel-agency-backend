import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { RoleQueryDto } from './dto/role-query.dto';

const defaultRoleSelect = Prisma.validator<Prisma.RoleSelect>()({
  id: true,
  description: true,
  name: true,
});
const defaultRoleWithPermissionsSelect = Prisma.validator<Prisma.RoleSelect>()({
  id: true,
  description: true,
  name: true,
  role_permissions: {
    select: {
      permission: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  },
});
@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  async create(createRoleDto: CreateRoleDto) {
    const { name, description, permission_ids } = createRoleDto;
    const role = await this.prisma.role.create({
      data: {
        name,
        description,
        role_permissions: permission_ids?.length
          ? {
              create: permission_ids.map((permission_id) => ({
                permission_id,
              })),
            }
          : undefined,
      },
      select: defaultRoleSelect,
    });
    return role;
  }

  async findAll(query: RoleQueryDto) {
    return this.prisma.role.findMany({
      select: defaultRoleSelect,
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      select: defaultRoleWithPermissionsSelect,
    });
    if (!role) {
      throw new Error('Role not found');
    }
    return role;
  }
  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id); // Ensure the role exists before updating
    const updatedata: Prisma.RoleUpdateInput = {
      name: dto.name,
      description: dto.description,
    };
    if (dto.permission_ids) {
      updatedata.role_permissions = {
        deleteMany: {}, // Remove existing permissions
        create: dto.permission_ids.map((permission_id) => ({
          permission_id,
        })),
      };
    }
    const role = await this.prisma.role.update({
      where: { id },
      data: updatedata,
      select: defaultRoleSelect,
    });
    return role;
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure the role exists before deleting
    //check the role is assigned to any user
    const usersWithRole = await this.prisma.user.findMany({
      where: {
        user_roles: {
          some: {
            role_id: id,
          },
        },
      },
      select: {
        id: true,
        email: true,
      },
    });
    if (usersWithRole.length > 0) {
      throw new Error('Cannot delete role as it is assigned to users');
    }

    return this.prisma.role.delete({
      where: { id },
      select: defaultRoleSelect,
    });
  }

  async assignPermissions(roleId: string, dto: AssignPermissionsDto) {
    await this.findOne(roleId);
    const updatedRole = await this.prisma.role.update({
      where: { id: roleId },
      data: {
        role_permissions: {
          deleteMany: {}, // Remove existing permissions
          create: dto.permission_ids.map((permission_id) => ({
            permission_id,
          })),
        },
      },
      select: defaultRoleSelect,
    });
    return updatedRole;
  }
}
