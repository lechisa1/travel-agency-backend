import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsUUID,
  IsDateString,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryStaffScheduleDto {
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

  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', required: false })
  @IsOptional()
  @IsUUID()
  staff_id?: string;

  @ApiProperty({ example: 'morning', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['morning', 'afternoon', 'evening', 'night', 'full_day', 'on_call'])
  shift_type?: string;

  @ApiProperty({ example: '2026-01-01', required: false })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiProperty({ example: '2026-12-31', required: false })
  @IsOptional()
  @IsDateString()
  to_date?: string;
}