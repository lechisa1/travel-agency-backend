import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNumber,
  IsIn,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMaintenanceLogDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8' })
  @IsUUID()
  vehicle_id: string;

  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', required: false })
  @IsOptional()
  @IsUUID()
  driver_id?: string;

  @ApiProperty({ example: 'oil_change' })
  @IsString()
  @IsIn(['oil_change', 'tire_rotation', 'brake_service', 'inspection', 'repair', 'other'])
  type: string;

  @ApiProperty({ example: 'scheduled', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['scheduled', 'in_progress', 'completed', 'cancelled'])
  status?: string = 'scheduled';

  @ApiProperty({ example: 'Routine 10,000 km service', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 75.0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost?: number;

  @ApiProperty({ example: 'Al Maha Auto Garage', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  garage_name?: string;

  @ApiProperty({ example: '2026-12-15', required: false })
  @IsOptional()
  @IsDateString()
  scheduled_date?: string;

  @ApiProperty({ example: '2026-12-16', required: false })
  @IsOptional()
  @IsDateString()
  completed_date?: string;
}