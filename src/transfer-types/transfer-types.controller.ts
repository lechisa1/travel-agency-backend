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
import { TransferTypesService } from './transfer-types.service';
import { CreateTransferTypeDto } from './dto/create-transfer-type.dto';
import { UpdateTransferTypeDto } from './dto/update-transfer-type.dto';

@ApiTags('Transfers - Types')
@ApiBearerAuth()
@Controller('transfers/types')
export class TransferTypesController {
  constructor(
    private readonly transferTypesService: TransferTypesService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateTransferTypeDto) {
    return this.transferTypesService.create(dto);
  }

  @Get()
  findAll() {
    return this.transferTypesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.transferTypesService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransferTypeDto,
  ) {
    return this.transferTypesService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.transferTypesService.remove(id);
  }
}