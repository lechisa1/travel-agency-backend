import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsNumber,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVisaApplicationDto {
  @ApiProperty({ example: '26eb4771-1297-46bc-857f-e25803a29aa1' })
  @IsUUID()
  customer_id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8', required: false })
  @IsOptional()
  @IsUUID()
  visa_type_id?: string;

  @ApiProperty({ example: 'd1e2f3a4-b5c6-7890-h1i2-j3k4l5m6n7o8', required: false })
  @IsOptional()
  @IsUUID()
  destination_id?: string;

  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', required: false })
  @IsOptional()
  @IsUUID()
  officer_id?: string;

  @ApiProperty({ example: 'A12345678' })
  @IsString()
  @MaxLength(100)
  passport_number: string;

  @ApiProperty({ example: 'Omani' })
  @IsString()
  @MaxLength(100)
  nationality: string;

  @ApiProperty({ example: '2026-09-15', required: false })
  @IsOptional()
  @IsDateString()
  applied_date?: string;

  @ApiProperty({ example: 'submitted', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string = 'submitted';

  @ApiProperty({ example: 150.0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  visa_fee?: number = 0;

  @ApiProperty({ example: 25.0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  service_charge?: number = 0;

  @ApiProperty({ example: 'Urgent processing requested', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}