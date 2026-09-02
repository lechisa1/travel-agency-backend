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
import { HotelPartnersService } from './hotel-partners.service';
import { CreateHotelPartnerDto } from './dto/create-hotel-partner.dto';
import { UpdateHotelPartnerDto } from './dto/update-hotel-partner.dto';

@ApiTags('Hotel - Partners')
@ApiBearerAuth()
@Controller('hotel/partners')
export class HotelPartnersController {
  constructor(
    private readonly hotelPartnersService: HotelPartnersService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateHotelPartnerDto) {
    return this.hotelPartnersService.create(dto);
  }

  @Get()
  findAll() {
    return this.hotelPartnersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelPartnersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHotelPartnerDto,
  ) {
    return this.hotelPartnersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.hotelPartnersService.remove(id);
  }
}