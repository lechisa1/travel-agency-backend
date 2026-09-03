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
import { StaffSchedulesService } from './staff-schedules.service';
import { CreateStaffScheduleDto } from './dto/create-staff-schedule.dto';
import { UpdateStaffScheduleDto } from './dto/update-staff-schedule.dto';
import { QueryStaffScheduleDto } from './dto/query-staff-schedule.dto';

@ApiTags('Calendar - Staff Schedules')
@ApiBearerAuth()
@Controller('staff-schedules')
export class StaffSchedulesController {
  constructor(
    private readonly staffSchedulesService: StaffSchedulesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateStaffScheduleDto) {
    return this.staffSchedulesService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryStaffScheduleDto) {
    return this.staffSchedulesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.staffSchedulesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStaffScheduleDto,
  ) {
    return this.staffSchedulesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.staffSchedulesService.remove(id);
  }
}