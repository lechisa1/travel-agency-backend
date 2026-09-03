import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsInt,
  IsNumber,
  IsIn,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierCommissionDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8' })
  @IsUUID()
  supplier_id: string;

  @ApiProperty({ example: '2026-01-01' })
  @IsDateString()
  period_start: string;

  @ApiProperty({ example: '2026-01-31' })
  @IsDateString()
  period_end: string;

  @ApiProperty({ example: 25, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  total_bookings?: number = 0;

  @ApiProperty({ example: 50000.0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  total_revenue?: number = 0;

  @ApiProperty({ example: 10.0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  commission_rate?: number = 0;

  @ApiProperty({ example: 5000.0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  commission_amount?: number = 0;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  paid_amount?: number = 0;

  @ApiProperty({ example: 'pending', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'approved', 'paid', 'disputed'])
  status?: string = 'pending';
}