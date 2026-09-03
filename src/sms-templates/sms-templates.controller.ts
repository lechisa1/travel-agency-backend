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
import { SmsTemplatesService } from './sms-templates.service';
import { CreateSmsTemplateDto } from './dto/create-sms-template.dto';
import { UpdateSmsTemplateDto } from './dto/update-sms-template.dto';

@ApiTags('Settings - SMS Templates')
@ApiBearerAuth()
@Controller('settings/sms-templates')
export class SmsTemplatesController {
  constructor(
    private readonly smsTemplatesService: SmsTemplatesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSmsTemplateDto) {
    return this.smsTemplatesService.create(dto);
  }

  @Get()
  findAll(@Query('module') module?: string) {
    return this.smsTemplatesService.findAll(module);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.smsTemplatesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSmsTemplateDto,
  ) {
    return this.smsTemplatesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.smsTemplatesService.remove(id);
  }
}