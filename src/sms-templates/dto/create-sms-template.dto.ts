import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSmsTemplateDto {
  @ApiProperty({ example: 'Booking Reminder' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Hi {{customer_name}}, your flight is on {{travel_date}}.' })
  @IsString()
  body: string;

  @ApiProperty({ example: 'bookings', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  module?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}