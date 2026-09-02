import { Controller } from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { AirlineService } from './airline.service';
import { CreateAirlineDto } from './dto/create-airline.dto';
import { UpdateAirlineDto } from './dto/update-airline.dto';
import {
  ParseUUIDPipe,
  Body,
  Param,
  Post,
  Get,
  Patch,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/core/guards/jwt-auth.guard';
import { UseGuards } from '@nestjs/common';
@ApiTags('Airline')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('airline')
export class AirlineController {
  constructor(private readonly airlineService: AirlineService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAirlineDto: CreateAirlineDto) {
    return this.airlineService.create(createAirlineDto);
  }

  @Get()
  findAll() {
    return this.airlineService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.airlineService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateAirlineDto: UpdateAirlineDto,
  ) {
    return this.airlineService.update(id, updateAirlineDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.airlineService.remove(id);
  }
}
