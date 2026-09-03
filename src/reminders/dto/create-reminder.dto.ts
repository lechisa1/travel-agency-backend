import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReminderDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8' })
  @IsUUID()
  event_id: string;

  @ApiProperty({ example: '2026-12-15T09:30:00Z' })
  @IsDateString()
  remind_at: string;

  @ApiProperty({ example: 'notification', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['notification', 'email', 'sms'])
  method?: string = 'notification';
}