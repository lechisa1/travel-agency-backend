import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCalendarEventDto {
  @ApiProperty({ example: 'Client meeting - Mr. Ahmed' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'd1e2f3a4-b5c6-7890-h1i2-j3k4l5m6n7o8', required: false })
  @IsOptional()
  @IsUUID()
  type_id?: string;

  @ApiProperty({ example: '2026-12-15T10:00:00Z' })
  @IsDateString()
  start_at: string;

  @ApiProperty({ example: '2026-12-15T11:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  end_at?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  all_day?: boolean = false;

  @ApiProperty({ example: 'Discuss Maldives package options', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'Office - Conference Room A', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiProperty({ example: 'flight_booking', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  entity_type?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8', required: false })
  @IsOptional()
  @IsUUID()
  entity_id?: string;

  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', required: false })
  @IsOptional()
  @IsUUID()
  created_by?: string;
}