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
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@ApiTags('Calendar - Reminders')
@ApiBearerAuth()
@Controller('calendar/reminders')
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateReminderDto) {
    return this.remindersService.create(dto);
  }

  @Get()
  findByEvent(
    @Query('event_id', ParseUUIDPipe) eventId: string,
  ) {
    return this.remindersService.findByEvent(eventId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.remindersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateReminderDto,
  ) {
    return this.remindersService.update(id, dto);
  }

  @Patch(':id/sent')
  markSent(@Param('id', ParseUUIDPipe) id: string) {
    return this.remindersService.markSent(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.remindersService.remove(id);
  }
}