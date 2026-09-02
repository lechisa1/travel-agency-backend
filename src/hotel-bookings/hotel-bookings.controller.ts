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
import { HotelBookingsService } from './hotel-bookings.service';
import { CreateHotelBookingDto } from './dto/create-hotel-booking.dto';
import { UpdateHotelBookingDto } from './dto/update-hotel-booking.dto';
import { QueryHotelBookingDto } from './dto/query-hotel-booking.dto';

@ApiTags('Hotel - Bookings')
@ApiBearerAuth()
@Controller('hotel/bookings')
export class HotelBookingsController {
  constructor(
    private readonly hotelBookingsService: HotelBookingsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateHotelBookingDto) {
    return this.hotelBookingsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryHotelBookingDto) {
    return this.hotelBookingsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelBookingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHotelBookingDto,
  ) {
    return this.hotelBookingsService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: string },
  ) {
    if (!body?.status) {
      throw new BadRequestException('Status is required in the request body');
    }
    return this.hotelBookingsService.updateStatus(id, body.status);
  }

  @Post(':id/voucher')
  @HttpCode(HttpStatus.CREATED)
  issueVoucher(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelBookingsService.issueVoucher(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelBookingsService.remove(id);
  }
}