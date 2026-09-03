import { Module } from '@nestjs/common';
import { CalendarEventsService } from './calendar-events.service';
import { CalendarEventsController } from './calendar-events.controller';
import { RemindersService } from '../reminders/reminders.service';
import { RemindersController } from '../reminders/reminders.controller';

@Module({
  providers: [CalendarEventsService, RemindersService],
  controllers: [CalendarEventsController, RemindersController],
  exports: [CalendarEventsService, RemindersService],
})
export class CalendarEventsModule {}