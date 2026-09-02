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
import { VisaApplicationsService } from './visa-applications.service';
import { CreateVisaApplicationDto } from './dto/create-visa-application.dto';
import { UpdateVisaApplicationDto } from './dto/update-visa-application.dto';
import { QueryVisaApplicationDto } from './dto/query-visa-application.dto';
import { BadRequestException } from '@nestjs/common';

@ApiTags('Visa - Applications')
@ApiBearerAuth()
@Controller('visa/applications')
export class VisaApplicationsController {
  constructor(
    private readonly visaApplicationsService: VisaApplicationsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateVisaApplicationDto) {
    return this.visaApplicationsService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryVisaApplicationDto) {
    return this.visaApplicationsService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.visaApplicationsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVisaApplicationDto,
  ) {
    return this.visaApplicationsService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: string },
  ) {
    if (!body?.status) {
      throw new BadRequestException('Status is required in the request body');
    }
    return this.visaApplicationsService.updateStatus(id, body.status);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.visaApplicationsService.remove(id);
  }
}