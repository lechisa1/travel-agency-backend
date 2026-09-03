import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsInt,
  IsNumber,
  IsIn,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferDto {
  @ApiProperty({ example: '26eb4771-1297-46bc-857f-e25803a29aa1', required: false })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8', required: false })
  @IsOptional()
  @IsUUID()
  vehicle_id?: string;

  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', required: false })
  @IsOptional()
  @IsUUID()
  driver_id?: string;

  @ApiProperty({ example: 'd1e2f3a4-b5c6-7890-h1i2-j3k4l5m6n7o8', required: false })
  @IsOptional()
  @IsUUID()
  transfer_type_id?: string;

  @ApiProperty({ example: 'Muscat International Airport (MCT)' })
  @IsString()
  @MaxLength(255)
  pickup_location: string;

  @ApiProperty({ example: 'Grand Hyatt Muscat' })
  @IsString()
  @MaxLength(255)
  dropoff_location: string;

  @ApiProperty({ example: '2026-12-15T14:30:00Z' })
  @IsDateString()
  date_time: string;

  @ApiProperty({ example: 2, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pax?: number = 1;

  @ApiProperty({ example: 25.5, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  distance_km?: number;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  luggage_count?: number = 0;

  @ApiProperty({ example: 30.0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  cost: number;

  @ApiProperty({ example: 'OMR', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string = 'OMR';

  @ApiProperty({ example: 'pending', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'partial', 'paid', 'refunded'])
  payment_status?: string = 'pending';

  @ApiProperty({ example: 'assigned', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['assigned', 'in_progress', 'completed', 'cancelled', 'no_show'])
  status?: string = 'assigned';

  @ApiProperty({ example: 'Customer prefers child seat', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}