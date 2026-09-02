import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { PermissionService } from './permission.service';
import { ParseUUIDPipe } from '@nestjs/common/pipes';
import { PermissionQueryDto } from './dto/permission-query.dto';
@ApiTags('Permission')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('permission')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Get()
  findAll(@Query() query: PermissionQueryDto) {
    return this.permissionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.permissionService.findOne(id);
  }
}
