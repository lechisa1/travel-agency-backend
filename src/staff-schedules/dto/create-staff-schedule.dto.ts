import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateStaffScheduleDto {
  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsUUID()
  staff_id: string;

  @ApiProperty({ example: '2026-12-15T08:00:00Z' })
  @IsDateString()
  start_at: string;

  @ApiProperty({ example: '2026-12-15T16:00:00Z' })
  @IsDateString()
  end_at: string;

  @ApiProperty({ example: 'morning', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['morning', 'afternoon', 'evening', 'night', 'full_day', 'on_call'])
  shift_type?: string;

  @ApiProperty({ example: 'Covering visa desk', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}