import { Module } from '@nestjs/common';
import { StaffSchedulesService } from './staff-schedules.service';
import { StaffSchedulesController } from './staff-schedules.controller';

@Module({
  providers: [StaffSchedulesService],
  controllers: [StaffSchedulesController],
  exports: [StaffSchedulesService],
})
export class StaffSchedulesModule {}