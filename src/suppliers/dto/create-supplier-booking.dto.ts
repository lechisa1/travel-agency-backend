import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsIn,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierBookingDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8' })
  @IsUUID()
  supplier_id: string;

  @ApiProperty({ example: 'b1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8', required: false })
  @IsOptional()
  @IsUUID()
  booking_id?: string;

  @ApiProperty({ example: 'hotel_booking', required: false })
  @IsOptional()
  @IsString()
  @IsIn([
    'flight_booking',
    'hotel_booking',
    'transfer',
    'package_booking',
    'group_booking',
    'visa_application',
    'insurance_policy',
  ])
  booking_type?: string;

  @ApiProperty({ example: 4500.0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  booking_amount: number;

  @ApiProperty({ example: 10.0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  commission_rate?: number = 0;

  @ApiProperty({ example: 450.0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  commission_amount?: number;
}