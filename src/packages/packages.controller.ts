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
import { PackagesService } from './packages.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { QueryPackageDto } from './dto/query-package.dto';

@ApiTags('Packages')
@ApiBearerAuth()
@Controller('packages')
export class PackagesController {
  constructor(private readonly packagesService: PackagesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePackageDto) {
    return this.packagesService.create(dto);
  }

  @Get()
  findAll(@Query() query: QueryPackageDto) {
    return this.packagesService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePackageDto,
  ) {
    return this.packagesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.packagesService.remove(id);
  }
}