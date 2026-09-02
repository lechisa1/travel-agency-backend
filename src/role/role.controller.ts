import {
  Controller,
  UseGuards,
  HttpCode,
  HttpStatus,
  Post,
  Body,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { RoleService } from './role.service';

import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { CreateRoleDto } from './dto/create-role.dto';
import { AssignPermissionsDto } from './dto/assign-permissions.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { Delete, Param, Patch, Query } from '@nestjs/common/decorators';
import { RoleQueryDto } from './dto/role-query.dto';
@UseGuards(JwtAuthGuard)
@ApiTags('Role')
@ApiBearerAuth()
@Controller('role')
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  createRole(@Body() createRoleDto: CreateRoleDto) {
    return this.roleService.create(createRoleDto);
  }

  @Get()
  findAllRoles(@Query() query: RoleQueryDto) {
    return this.roleService.findAll(query);
  }

  @Get(':id')
  findRoleById(@Param('id', ParseUUIDPipe) id: string) {
    return this.roleService.findOne(id);
  }

  @Post(':id/assign-permissions')
  assignPermissions(
    @Param('id', ParseUUIDPipe) roleId: string,
    @Body() dto: AssignPermissionsDto,
  ) {
    return this.roleService.assignPermissions(roleId, dto);
  }

  @Patch(':id')
  updateRole(
    @Param('id', ParseUUIDPipe) roleId: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.roleService.update(roleId, updateRoleDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeRole(@Param('id', ParseUUIDPipe) roleId: string) {
    return this.roleService.remove(roleId);
  }
}
