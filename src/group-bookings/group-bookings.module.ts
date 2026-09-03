import { Module } from '@nestjs/common';
import { GroupBookingsService } from './group-bookings.service';
import { GroupBookingsController } from './group-bookings.controller';

@Module({
  providers: [GroupBookingsService],
  controllers: [GroupBookingsController],
  exports: [GroupBookingsService],
})
export class GroupBookingsModule {}