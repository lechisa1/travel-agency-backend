import {
  IsString,
  IsOptional,
  IsBoolean,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateEmailTemplateDto {
  @ApiProperty({ example: 'Booking Confirmation' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Your booking {{booking_reference}} is confirmed' })
  @IsString()
  @MaxLength(255)
  subject: string;

  @ApiProperty({ example: '<p>Dear {{customer_name}}, your booking is confirmed.</p>' })
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