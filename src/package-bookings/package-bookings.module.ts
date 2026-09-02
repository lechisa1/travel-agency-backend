import { Module } from '@nestjs/common';
import { PackageBookingsService } from './package-bookings.service';
import { PackageBookingsController } from './package-bookings.controller';

@Module({
  providers: [PackageBookingsService],
  controllers: [PackageBookingsController],
  exports: [PackageBookingsService],
})
export class PackageBookingsModule {}