import {
  IsString,
  IsOptional,
  IsUUID,
  IsInt,
  IsNumber,
  IsDateString,
  IsIn,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVehicleDto {
  @ApiProperty({ example: 'MUS-12345' })
  @IsString()
  @MaxLength(50)
  plate_number: string;

  @ApiProperty({ example: 'Toyota Coaster 2024' })
  @IsString()
  @MaxLength(255)
  model: string;

  @ApiProperty({ example: 'van' })
  @IsString()
  @IsIn(['sedan', 'suv', 'van', 'bus', 'minibus', 'luxury', 'coaster'])
  type: string;

  @ApiProperty({ example: 12 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', required: false })
  @IsOptional()
  @IsUUID()
  current_driver_id?: string;

  @ApiProperty({ example: 'available', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['available', 'in_use', 'maintenance', 'unassigned', 'retired'])
  status?: string = 'unassigned';

  @ApiProperty({ example: 50000.0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  mileage_km?: number = 0;

  @ApiProperty({ example: 'diesel', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  fuel_type?: string;

  @ApiProperty({ example: '2026-06-01', required: false })
  @IsOptional()
  @IsDateString()
  last_service_date?: string;

  @ApiProperty({ example: '2026-12-01', required: false })
  @IsOptional()
  @IsDateString()
  next_service_due?: string;

  @ApiProperty({ example: '2026-12-31', required: false })
  @IsOptional()
  @IsDateString()
  insurance_expiry?: string;

  @ApiProperty({ example: '2026-12-31', required: false })
  @IsOptional()
  @IsDateString()
  registration_expiry?: string;
}