import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CompanyProfileService } from './company-profile.service';
import { UpsertCompanyProfileDto } from './dto/upsert-company-profile.dto';
import { JwtAuthGuard } from '../core/guards/jwt-auth.guard';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../core/guards/roles.guard';

@ApiTags('Settings - Company Profile')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('settings/company-profile')
export class CompanyProfileController {
  constructor(private readonly companyProfileService: CompanyProfileService) {}

  @Get()
  @Public()
  get() {
    return this.companyProfileService.get();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)

  // @Roles('admin')
  upsert(@Body() dto: UpsertCompanyProfileDto) {
    return this.companyProfileService.upsert(dto);
  }

  @Patch()
  update(@Body() dto: UpsertCompanyProfileDto) {
    return this.companyProfileService.update(dto);
  }
}
