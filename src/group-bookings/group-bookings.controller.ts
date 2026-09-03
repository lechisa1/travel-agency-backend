import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GroupBookingsService } from './group-bookings.service';
import { CreateGroupBookingDto } from './dto/create-group-booking.dto';
import { UpdateGroupBookingDto } from './dto/update-group-booking.dto';
import { QueryGroupBookingDto } from './dto/query-group-booking.dto';
import { CreateGroupMemberInlineDto } from './dto/create-group-member.dto';
import { UpdateGroupMemberDto } from './dto/update-group-member.dto';

@ApiTags('Group Bookings')
@ApiBearerAuth()
@Controller('group-bookings')
export class GroupBookingsController {
  constructor(
    private readonly groupBookingsService: GroupBookingsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateGroupBookingDto) {
    return this.groupBookingsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryGroupBookingDto) {
    return this.groupBookingsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.groupBookingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGroupBookingDto,
  ) {
    return this.groupBookingsService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: string },
  ) {
    if (!body?.status) {
      throw new BadRequestException('Status is required in the request body');
    }
    return this.groupBookingsService.updateStatus(id, body.status);
  }

  // -------- Members --------

  @Post(':id/members')
  @HttpCode(HttpStatus.CREATED)
  addMember(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateGroupMemberInlineDto,
  ) {
    return this.groupBookingsService.addMember(id, dto);
  }

  @Patch(':id/members/:memberId')
  updateMember(
    @Param('memberId', ParseUUIDPipe) memberId: string,
    @Body() dto: UpdateGroupMemberDto,
  ) {
    return this.groupBookingsService.updateMember(memberId, dto);
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    return this.groupBookingsService.removeMember(memberId);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.groupBookingsService.remove(id);
  }
}