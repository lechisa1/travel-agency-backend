import {
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  IsInt,
  Min,
  Max,
  IsBoolean,
  IsNumber,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateHotelPartnerDto {
  @ApiProperty({ example: 'Grand Hyatt Muscat' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Muscat, Oman', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiProperty({ example: 4.5, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(5)
  rating?: number;

  @ApiProperty({ example: 320, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  reviews_count?: number = 0;

  @ApiProperty({ example: ['wifi', 'pool', 'spa'], required: false })
  @IsOptional()
  amenities?: any;

  @ApiProperty({ example: 'reservations@hyatt.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+96812345678', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ example: 'https://hyatt.com', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = true;
}