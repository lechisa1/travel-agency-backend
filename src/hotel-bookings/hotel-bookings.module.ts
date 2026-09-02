import { Module } from '@nestjs/common';
import { HotelBookingsService } from './hotel-bookings.service';
import { HotelBookingsController } from './hotel-bookings.controller';

@Module({
  providers: [HotelBookingsService],
  controllers: [HotelBookingsController],
  exports: [HotelBookingsService],
})
export class HotelBookingsModule {}