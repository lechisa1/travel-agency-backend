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
} from '@nestjs/common';
import { FlightBookingsService } from './flight-bookings.service';
import { CreateFlightBookingDto } from './dto/create-flight-booking.dto';
import { UpdateFlightBookingDto } from './dto/update-flight-booking.dto';
import { QueryFlightBookingDto } from './dto/query-flight-booking.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('Flight Bookings')
@ApiBearerAuth()
@Controller('flight-bookings')
export class FlightBookingsController {
  constructor(private readonly flightBookingsService: FlightBookingsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createFlightBookingDto: CreateFlightBookingDto) {
    return this.flightBookingsService.create(createFlightBookingDto);
  }

  @Get()
  findAll(@Query() query: QueryFlightBookingDto) {
    return this.flightBookingsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.flightBookingsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateFlightBookingDto: UpdateFlightBookingDto,
  ) {
    return this.flightBookingsService.update(id, updateFlightBookingDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.flightBookingsService.remove(id);
  }
}
