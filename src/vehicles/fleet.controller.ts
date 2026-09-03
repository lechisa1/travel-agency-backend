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
import { FleetService } from './fleet.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CreateDriverDto } from '../drivers/dto/create-driver.dto';
import { UpdateDriverDto } from '../drivers/dto/update-driver.dto';
import { CreateMaintenanceLogDto } from '../maintenance-logs/dto/create-maintenance-log.dto';
import { UpdateMaintenanceLogDto } from '../maintenance-logs/dto/update-maintenance-log.dto';

@ApiTags('Fleet')
@ApiBearerAuth()
@Controller('fleet')
export class FleetController {
  constructor(private readonly fleetService: FleetService) {}

  // ---- Vehicles ----
  @Post('vehicles')
  @HttpCode(HttpStatus.CREATED)
  createVehicle(@Body() dto: CreateVehicleDto) {
    return this.fleetService.createVehicle(dto);
  }

  @Get('vehicles')
  findAllVehicles() {
    return this.fleetService.findAllVehicles();
  }

  @Get('vehicles/:id')
  findOneVehicle(@Param('id', ParseUUIDPipe) id: string) {
    return this.fleetService.findOneVehicle(id);
  }

  @Patch('vehicles/:id')
  updateVehicle(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVehicleDto,
  ) {
    return this.fleetService.updateVehicle(id, dto);
  }

  @Delete('vehicles/:id')
  removeVehicle(@Param('id', ParseUUIDPipe) id: string) {
    return this.fleetService.removeVehicle(id);
  }

  // ---- Drivers ----
  @Post('drivers')
  @HttpCode(HttpStatus.CREATED)
  createDriver(@Body() dto: CreateDriverDto) {
    return this.fleetService.createDriver(dto);
  }

  @Get('drivers')
  findAllDrivers() {
    return this.fleetService.findAllDrivers();
  }

  @Get('drivers/:id')
  findOneDriver(@Param('id', ParseUUIDPipe) id: string) {
    return this.fleetService.findOneDriver(id);
  }

  @Patch('drivers/:id')
  updateDriver(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDriverDto,
  ) {
    return this.fleetService.updateDriver(id, dto);
  }

  @Delete('drivers/:id')
  removeDriver(@Param('id', ParseUUIDPipe) id: string) {
    return this.fleetService.removeDriver(id);
  }

  // ---- Maintenance ----
  @Post('maintenance')
  @HttpCode(HttpStatus.CREATED)
  createMaintenanceLog(@Body() dto: CreateMaintenanceLogDto) {
    return this.fleetService.createMaintenanceLog(dto);
  }

  @Get('maintenance')
  findMaintenanceLogs(@Query('vehicle_id') vehicleId?: string) {
    return this.fleetService.findMaintenanceLogs(vehicleId);
  }

  @Get('maintenance/:id')
  findOneMaintenanceLog(@Param('id', ParseUUIDPipe) id: string) {
    return this.fleetService.findOneMaintenanceLog(id);
  }

  @Patch('maintenance/:id')
  updateMaintenanceLog(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMaintenanceLogDto,
  ) {
    return this.fleetService.updateMaintenanceLog(id, dto);
  }

  @Patch('maintenance/:id/status')
  updateMaintenanceStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: string },
  ) {
    if (!body?.status) {
      throw new BadRequestException('Status is required in the request body');
    }
    return this.fleetService.updateMaintenanceStatus(id, body.status);
  }

  @Delete('maintenance/:id')
  removeMaintenanceLog(@Param('id', ParseUUIDPipe) id: string) {
    return this.fleetService.removeMaintenanceLog(id);
  }
}