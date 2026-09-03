import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateVehicleDto } from './dto/create-vehicle.dto';
import { UpdateVehicleDto } from './dto/update-vehicle.dto';
import { CreateDriverDto } from '../drivers/dto/create-driver.dto';
import { UpdateDriverDto } from '../drivers/dto/update-driver.dto';
import { CreateMaintenanceLogDto } from '../maintenance-logs/dto/create-maintenance-log.dto';
import { UpdateMaintenanceLogDto } from '../maintenance-logs/dto/update-maintenance-log.dto';

@Injectable()
export class FleetService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------------- Vehicles ----------------

  async createVehicle(dto: CreateVehicleDto) {
    if (dto.current_driver_id) {
      const d = await this.prisma.driver.findUnique({
        where: { id: dto.current_driver_id },
      });
      if (!d) {
        throw new BadRequestException(
          `Driver with ID ${dto.current_driver_id} not found`,
        );
      }
      // Driver has unique vehicle_id; if a different vehicle is already assigned, fail fast
      if (d.vehicle_id && d.vehicle_id !== null) {
        throw new BadRequestException(
          `Driver ${d.full_name} is already assigned to another vehicle`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const vehicle = await tx.vehicle.create({
        data: {
          plate_number: dto.plate_number,
          model: dto.model,
          type: dto.type,
          capacity: dto.capacity,
          current_driver_id: dto.current_driver_id,
          status: dto.status ?? 'unassigned',
          mileage_km: dto.mileage_km ?? 0,
          fuel_type: dto.fuel_type,
          last_service_date: dto.last_service_date
            ? new Date(dto.last_service_date)
            : undefined,
          next_service_due: dto.next_service_due
            ? new Date(dto.next_service_due)
            : undefined,
          insurance_expiry: dto.insurance_expiry
            ? new Date(dto.insurance_expiry)
            : undefined,
          registration_expiry: dto.registration_expiry
            ? new Date(dto.registration_expiry)
            : undefined,
        },
      });

      if (dto.current_driver_id) {
        await tx.driver.update({
          where: { id: dto.current_driver_id },
          data: { vehicle_id: vehicle.id },
        });
      }

      return vehicle;
    });
  }

  async findAllVehicles() {
    return this.prisma.vehicle.findMany({
      orderBy: { plate_number: 'asc' },
      include: {
        driver: {
          select: { id: true, full_name: true, phone: true, rating: true },
        },
        _count: { select: { transfers: true, maintenance_logs: true } },
      },
    });
  }

  async findOneVehicle(id: string) {
    const v = await this.prisma.vehicle.findUnique({
      where: { id },
      include: {
        driver: {
          select: {
            id: true,
            full_name: true,
            phone: true,
            rating: true,
            license_number: true,
            license_expiry: true,
          },
        },
        transfers: {
          orderBy: { date_time: 'desc' },
          take: 20,
          select: {
            id: true,
            booking_reference: true,
            pickup_location: true,
            dropoff_location: true,
            date_time: true,
            status: true,
          },
        },
        maintenance_logs: {
          orderBy: { scheduled_date: 'desc' },
          take: 20,
        },
      },
    });
    if (!v) {
      throw new NotFoundException(`Vehicle with ID ${id} not found`);
    }
    return v;
  }

  async updateVehicle(id: string, dto: UpdateVehicleDto) {
    const current = await this.findOneVehicle(id);

    if (dto.current_driver_id && dto.current_driver_id !== current.current_driver_id) {
      const d = await this.prisma.driver.findUnique({
        where: { id: dto.current_driver_id },
      });
      if (!d) {
        throw new BadRequestException(
          `Driver with ID ${dto.current_driver_id} not found`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.vehicle.update({
        where: { id },
        data: {
          ...(dto.plate_number !== undefined && { plate_number: dto.plate_number }),
          ...(dto.model !== undefined && { model: dto.model }),
          ...(dto.type !== undefined && { type: dto.type }),
          ...(dto.capacity !== undefined && { capacity: dto.capacity }),
          ...(dto.current_driver_id !== undefined && {
            current_driver_id: dto.current_driver_id,
          }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.mileage_km !== undefined && { mileage_km: dto.mileage_km }),
          ...(dto.fuel_type !== undefined && { fuel_type: dto.fuel_type }),
          ...(dto.last_service_date !== undefined && {
            last_service_date: new Date(dto.last_service_date),
          }),
          ...(dto.next_service_due !== undefined && {
            next_service_due: new Date(dto.next_service_due),
          }),
          ...(dto.insurance_expiry !== undefined && {
            insurance_expiry: new Date(dto.insurance_expiry),
          }),
          ...(dto.registration_expiry !== undefined && {
            registration_expiry: new Date(dto.registration_expiry),
          }),
        },
      });

      // Sync driver FK when assignment changes
      if (
        dto.current_driver_id !== undefined &&
        dto.current_driver_id !== current.current_driver_id
      ) {
        if (current.current_driver_id) {
          await tx.driver.update({
            where: { id: current.current_driver_id },
            data: { vehicle_id: null },
          });
        }
        if (dto.current_driver_id) {
          await tx.driver.update({
            where: { id: dto.current_driver_id },
            data: { vehicle_id: id },
          });
        }
      }

      return updated;
    });
  }

  async removeVehicle(id: string) {
    await this.findOneVehicle(id);
    const transferCount = await this.prisma.transfer.count({
      where: { vehicle_id: id },
    });
    const vehicle = await this.prisma.vehicle.findUnique({ where: { id } });

    if (transferCount > 0) {
      return this.prisma.vehicle.update({
        where: { id },
        data: { status: 'retired', current_driver_id: null },
        select: { id: true, plate_number: true, status: true },
      });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.maintenanceLog.deleteMany({ where: { vehicle_id: id } });
      if (vehicle?.current_driver_id) {
        await tx.driver.update({
          where: { id: vehicle.current_driver_id },
          data: { vehicle_id: null },
        });
      }
      return tx.vehicle.delete({
        where: { id },
        select: { id: true, plate_number: true },
      });
    });
  }

  // ---------------- Drivers ----------------

  async createDriver(dto: CreateDriverDto) {
    if (dto.vehicle_id) {
      const v = await this.prisma.vehicle.findUnique({
        where: { id: dto.vehicle_id },
      });
      if (!v) {
        throw new BadRequestException(
          `Vehicle with ID ${dto.vehicle_id} not found`,
        );
      }
      if (v.current_driver_id && v.current_driver_id !== null) {
        throw new BadRequestException(
          `Vehicle ${v.plate_number} is already assigned to another driver`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const driver = await tx.driver.create({
        data: {
          full_name: dto.full_name,
          phone: dto.phone,
          license_number: dto.license_number,
          license_expiry: dto.license_expiry
            ? new Date(dto.license_expiry)
            : undefined,
          vehicle_id: dto.vehicle_id,
          status: dto.status ?? 'available',
          rating: dto.rating ?? 0,
        },
      });

      if (dto.vehicle_id) {
        await tx.vehicle.update({
          where: { id: dto.vehicle_id },
          data: { current_driver_id: driver.id },
        });
      }

      return driver;
    });
  }

  async findAllDrivers() {
    return this.prisma.driver.findMany({
      orderBy: { full_name: 'asc' },
      include: {
        vehicle: {
          select: { id: true, plate_number: true, model: true, type: true },
        },
        _count: { select: { transfers: true, maintenance_logs: true } },
      },
    });
  }

  async findOneDriver(id: string) {
    const d = await this.prisma.driver.findUnique({
      where: { id },
      include: {
        vehicle: true,
        transfers: {
          orderBy: { date_time: 'desc' },
          take: 20,
          select: {
            id: true,
            booking_reference: true,
            pickup_location: true,
            dropoff_location: true,
            date_time: true,
            status: true,
          },
        },
        maintenance_logs: {
          orderBy: { scheduled_date: 'desc' },
          take: 20,
        },
      },
    });
    if (!d) {
      throw new NotFoundException(`Driver with ID ${id} not found`);
    }
    return d;
  }

  async updateDriver(id: string, dto: UpdateDriverDto) {
    const current = await this.findOneDriver(id);

    if (dto.vehicle_id && dto.vehicle_id !== current.vehicle_id) {
      const v = await this.prisma.vehicle.findUnique({
        where: { id: dto.vehicle_id },
      });
      if (!v) {
        throw new BadRequestException(
          `Vehicle with ID ${dto.vehicle_id} not found`,
        );
      }
      if (v.current_driver_id && v.current_driver_id !== id) {
        throw new BadRequestException(
          `Vehicle ${v.plate_number} is already assigned to another driver`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.driver.update({
        where: { id },
        data: {
          ...(dto.full_name !== undefined && { full_name: dto.full_name }),
          ...(dto.phone !== undefined && { phone: dto.phone }),
          ...(dto.license_number !== undefined && {
            license_number: dto.license_number,
          }),
          ...(dto.license_expiry !== undefined && {
            license_expiry: new Date(dto.license_expiry),
          }),
          ...(dto.vehicle_id !== undefined && { vehicle_id: dto.vehicle_id }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.rating !== undefined && { rating: dto.rating }),
        },
      });

      if (dto.vehicle_id !== undefined && dto.vehicle_id !== current.vehicle_id) {
        if (current.vehicle_id) {
          await tx.vehicle.update({
            where: { id: current.vehicle_id },
            data: { current_driver_id: null },
          });
        }
        if (dto.vehicle_id) {
          await tx.vehicle.update({
            where: { id: dto.vehicle_id },
            data: { current_driver_id: id },
          });
        }
      }

      return updated;
    });
  }

  async removeDriver(id: string) {
    await this.findOneDriver(id);
    const transferCount = await this.prisma.transfer.count({
      where: { driver_id: id },
    });
    const driver = await this.prisma.driver.findUnique({ where: { id } });

    if (transferCount > 0) {
      return this.prisma.driver.update({
        where: { id },
        data: { status: 'retired', vehicle_id: null },
        select: { id: true, full_name: true, status: true },
      });
    }
    return this.prisma.$transaction(async (tx) => {
      await tx.maintenanceLog.deleteMany({ where: { driver_id: id } });
      if (driver?.vehicle_id) {
        await tx.vehicle.update({
          where: { id: driver.vehicle_id },
          data: { current_driver_id: null },
        });
      }
      return tx.driver.delete({
        where: { id },
        select: { id: true, full_name: true },
      });
    });
  }

  // ---------------- Maintenance Logs ----------------

  async createMaintenanceLog(dto: CreateMaintenanceLogDto) {
    const v = await this.prisma.vehicle.findUnique({
      where: { id: dto.vehicle_id },
    });
    if (!v) {
      throw new BadRequestException(
        `Vehicle with ID ${dto.vehicle_id} not found`,
      );
    }
    if (dto.driver_id) {
      const d = await this.prisma.driver.findUnique({
        where: { id: dto.driver_id },
      });
      if (!d) {
        throw new BadRequestException(
          `Driver with ID ${dto.driver_id} not found`,
        );
      }
    }

    return this.prisma.maintenanceLog.create({
      data: {
        vehicle_id: dto.vehicle_id,
        driver_id: dto.driver_id,
        type: dto.type,
        status: dto.status ?? 'scheduled',
        description: dto.description,
        cost: dto.cost,
        garage_name: dto.garage_name,
        scheduled_date: dto.scheduled_date
          ? new Date(dto.scheduled_date)
          : undefined,
        completed_date: dto.completed_date
          ? new Date(dto.completed_date)
          : undefined,
      },
      include: {
        vehicle: { select: { id: true, plate_number: true, model: true } },
        driver: { select: { id: true, full_name: true } },
      },
    });
  }

  async findMaintenanceLogs(vehicleId?: string) {
    return this.prisma.maintenanceLog.findMany({
      where: vehicleId ? { vehicle_id: vehicleId } : undefined,
      orderBy: { scheduled_date: 'desc' },
      include: {
        vehicle: { select: { id: true, plate_number: true } },
        driver: { select: { id: true, full_name: true } },
      },
    });
  }

  async findOneMaintenanceLog(id: string) {
    const log = await this.prisma.maintenanceLog.findUnique({
      where: { id },
      include: {
        vehicle: { select: { id: true, plate_number: true, model: true } },
        driver: { select: { id: true, full_name: true } },
      },
    });
    if (!log) {
      throw new NotFoundException(
        `Maintenance log with ID ${id} not found`,
      );
    }
    return log;
  }

  async updateMaintenanceLog(id: string, dto: UpdateMaintenanceLogDto) {
    await this.findOneMaintenanceLog(id);
    return this.prisma.maintenanceLog.update({
      where: { id },
      data: {
        ...(dto.vehicle_id !== undefined && { vehicle_id: dto.vehicle_id }),
        ...(dto.driver_id !== undefined && { driver_id: dto.driver_id }),
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.cost !== undefined && { cost: dto.cost }),
        ...(dto.garage_name !== undefined && { garage_name: dto.garage_name }),
        ...(dto.scheduled_date !== undefined && {
          scheduled_date: new Date(dto.scheduled_date),
        }),
        ...(dto.completed_date !== undefined && {
          completed_date: new Date(dto.completed_date),
        }),
      },
      include: {
        vehicle: { select: { id: true, plate_number: true } },
        driver: { select: { id: true, full_name: true } },
      },
    });
  }

  async updateMaintenanceStatus(id: string, status: string) {
    const valid = ['scheduled', 'in_progress', 'completed', 'cancelled'];
    if (!valid.includes(status)) {
      throw new BadRequestException(
        `Invalid status '${status}'. Valid: ${valid.join(', ')}`,
      );
    }
    await this.findOneMaintenanceLog(id);
    return this.prisma.maintenanceLog.update({
      where: { id },
      data: { status },
      select: { id: true, status: true },
    });
  }

  async removeMaintenanceLog(id: string) {
    await this.findOneMaintenanceLog(id);
    return this.prisma.maintenanceLog.delete({
      where: { id },
      select: { id: true, vehicle_id: true },
    });
  }
}