import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsUUID,
  IsDateString,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryCalendarEventDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 50, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 50;

  @ApiProperty({ example: 'search-term', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: 'd1e2f3a4-b5c6-7890-h1i2-j3k4l5m6n7o8', required: false })
  @IsOptional()
  @IsUUID()
  type_id?: string;

  @ApiProperty({ example: 'flight_booking', required: false })
  @IsOptional()
  @IsString()
  entity_type?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8', required: false })
  @IsOptional()
  @IsUUID()
  entity_id?: string;

  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', required: false })
  @IsOptional()
  @IsUUID()
  created_by?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  all_day?: boolean;

  @ApiProperty({ example: '2026-01-01', required: false })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiProperty({ example: '2026-12-31', required: false })
  @IsOptional()
  @IsDateString()
  to_date?: string;
}