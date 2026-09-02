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
import { PackageCategoriesService } from './package-categories.service';
import { CreatePackageCategoryDto } from './dto/create-package-category.dto';
import { UpdatePackageCategoryDto } from './dto/update-package-category.dto';

@ApiTags('Packages - Categories')
@ApiBearerAuth()
@Controller('packages/categories')
export class PackageCategoriesController {
  constructor(
    private readonly packageCategoriesService: PackageCategoriesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreatePackageCategoryDto) {
    return this.packageCategoriesService.create(dto);
  }

  @Get()
  findAll() {
    return this.packageCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.packageCategoriesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePackageCategoryDto,
  ) {
    return this.packageCategoriesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.packageCategoriesService.remove(id);
  }
}