import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsInt,
  Min,
  IsNumber,
  IsIn,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePackageBookingDto {
  @ApiProperty({ example: 'd1e2f3a4-b5c6-7890-h1i2-j3k4l5m6n7o8', required: false })
  @IsOptional()
  @IsUUID()
  package_id?: string;

  @ApiProperty({ example: '26eb4771-1297-46bc-857f-e25803a29aa1', required: false })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiProperty({ example: 2 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pax: number;

  @ApiProperty({ example: 5000.0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  total_amount?: number;

  @ApiProperty({ example: 'pending', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'confirmed', 'cancelled', 'completed'])
  status?: string = 'pending';

  @ApiProperty({ example: '2026-12-15', required: false })
  @IsOptional()
  @IsDateString()
  travel_date?: string;
}