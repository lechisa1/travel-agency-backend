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
import { PackageBookingsService } from './package-bookings.service';
import { CreatePackageBookingDto } from './dto/create-package-booking.dto';
import { UpdatePackageBookingDto } from './dto/update-package-booking.dto';
import { QueryPackageBookingDto } from './dto/query-package-booking.dto';

@ApiTags('Packages - Bookings')
@ApiBearerAuth()
@Controller('package-bookings')
export class PackageBookingsController {
  constructor(
    private readonly packageBookingsService: PackageBookingsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePackageBookingDto) {
    return this.packageBookingsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryPackageBookingDto) {
    return this.packageBookingsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.packageBookingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePackageBookingDto,
  ) {
    return this.packageBookingsService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: string },
  ) {
    if (!body?.status) {
      throw new BadRequestException('Status is required in the request body');
    }
    return this.packageBookingsService.updateStatus(id, body.status);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.packageBookingsService.remove(id);
  }
}