import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CalendarEventTypesService } from './calendar-event-types.service';
import { CreateCalendarEventTypeDto } from './dto/create-calendar-event-type.dto';
import { UpdateCalendarEventTypeDto } from './dto/update-calendar-event-type.dto';

@ApiTags('Calendar - Event Types')
@ApiBearerAuth()
@Controller('calendar/event-types')
export class CalendarEventTypesController {
  constructor(
    private readonly calendarEventTypesService: CalendarEventTypesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateCalendarEventTypeDto) {
    return this.calendarEventTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.calendarEventTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.calendarEventTypesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCalendarEventTypeDto,
  ) {
    return this.calendarEventTypesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.calendarEventTypesService.remove(id);
  }
}