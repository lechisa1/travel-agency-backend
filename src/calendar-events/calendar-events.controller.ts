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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CalendarEventsService } from './calendar-events.service';
import { CreateCalendarEventDto } from './dto/create-calendar-event.dto';
import { UpdateCalendarEventDto } from './dto/update-calendar-event.dto';
import { QueryCalendarEventDto } from './dto/query-calendar-event.dto';

@ApiTags('Calendar - Events')
@ApiBearerAuth()
@Controller('calendar/events')
export class CalendarEventsController {
  constructor(
    private readonly calendarEventsService: CalendarEventsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCalendarEventDto) {
    return this.calendarEventsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryCalendarEventDto) {
    return this.calendarEventsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.calendarEventsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCalendarEventDto,
  ) {
    return this.calendarEventsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.calendarEventsService.remove(id);
  }
}