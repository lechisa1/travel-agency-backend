import { Module } from '@nestjs/common';
import { FlightBookingsService } from './flight-bookings.service';
import { FlightBookingsController } from './flight-bookings.controller';

@Module({
  providers: [FlightBookingsService],
  controllers: [FlightBookingsController],
  exports: [FlightBookingsService],
})
export class FlightBookingsModule {}
