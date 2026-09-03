import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { EmailConfigService } from './email-config.service';
import { UpsertEmailConfigDto } from './dto/upsert-email-config.dto';

@ApiTags('Settings - Email Config')
@ApiBearerAuth()
@Controller('settings/email-config')
export class EmailConfigController {
  constructor(private readonly emailConfigService: EmailConfigService) {}

  @Get()
  get() {
    return this.emailConfigService.get();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  upsert(@Body() dto: UpsertEmailConfigDto) {
    return this.emailConfigService.upsert(dto);
  }

  @Patch()
  update(@Body() dto: UpsertEmailConfigDto) {
    return this.emailConfigService.update(dto);
  }
}