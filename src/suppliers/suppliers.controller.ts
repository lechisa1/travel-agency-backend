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
  BadRequestException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuppliersService } from './suppliers.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { CreateSupplierBookingDto } from './dto/create-supplier-booking.dto';
import { UpdateSupplierBookingDto } from './dto/update-supplier-booking.dto';
import { CreateSupplierCommissionDto } from './dto/create-supplier-commission.dto';
import { UpdateSupplierCommissionDto } from './dto/update-supplier-commission.dto';

@ApiTags('Suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  // ---- Supplier ----
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateSupplierDto) {
    return this.suppliersService.create(dto);
  }

  @Get()
  findAll() {
    return this.suppliersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSupplierDto,
  ) {
    return this.suppliersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.remove(id);
  }

  // ---- Supplier Bookings ----
  @Post(':id/bookings')
  @HttpCode(HttpStatus.CREATED)
  createBooking(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateSupplierBookingDto,
  ) {
    return this.suppliersService.createBooking(id, dto);
  }

  @Get(':id/bookings')
  findBookings(@Param('id', ParseUUIDPipe) id: string) {
    return this.suppliersService.findBookingsBySupplier(id);
  }

  @Get('bookings/:bookingId')
  findOneBooking(@Param('bookingId', ParseUUIDPipe) bookingId: string) {
    return this.suppliersService.findOneBooking(bookingId);
  }

  @Patch('bookings/:bookingId')
  updateBooking(
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
    @Body() dto: UpdateSupplierBookingDto,
  ) {
    return this.suppliersService.updateBooking(bookingId, dto);
  }

  @Delete('bookings/:bookingId')
  removeBooking(@Param('bookingId', ParseUUIDPipe) bookingId: string) {
    return this.suppliersService.removeBooking(bookingId);
  }

  // ---- Supplier Commissions ----
  @Post('commissions')
  @HttpCode(HttpStatus.CREATED)
  createCommission(@Body() dto: CreateSupplierCommissionDto) {
    return this.suppliersService.createCommission(dto);
  }

  @Get('commissions')
  findCommissions(@Query('supplier_id') supplierId?: string) {
    return this.suppliersService.findCommissions(supplierId);
  }

  @Get('commissions/:commissionId')
  findOneCommission(
    @Param('commissionId', ParseUUIDPipe) commissionId: string,
  ) {
    return this.suppliersService.findOneCommission(commissionId);
  }

  @Patch('commissions/:commissionId')
  updateCommission(
    @Param('commissionId', ParseUUIDPipe) commissionId: string,
    @Body() dto: UpdateSupplierCommissionDto,
  ) {
    return this.suppliersService.updateCommission(commissionId, dto);
  }

  @Patch('commissions/:commissionId/status')
  updateCommissionStatus(
    @Param('commissionId', ParseUUIDPipe) commissionId: string,
    @Body() body: { status: string },
  ) {
    if (!body?.status) {
      throw new BadRequestException('Status is required in the request body');
    }
    return this.suppliersService.updateCommissionStatus(
      commissionId,
      body.status,
    );
  }

  @Delete('commissions/:commissionId')
  removeCommission(
    @Param('commissionId', ParseUUIDPipe) commissionId: string,
  ) {
    return this.suppliersService.removeCommission(commissionId);
  }
}