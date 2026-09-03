import { Module } from '@nestjs/common';
import { CalendarEventTypesService } from './calendar-event-types.service';
import { CalendarEventTypesController } from './calendar-event-types.controller';

@Module({
  providers: [CalendarEventTypesService],
  controllers: [CalendarEventTypesController],
  exports: [CalendarEventTypesService],
})
export class CalendarEventTypesModule {}