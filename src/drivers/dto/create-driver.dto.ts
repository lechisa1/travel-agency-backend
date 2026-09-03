import {
  IsString,
  IsOptional,
  IsDateString,
  IsNumber,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDriverDto {
  @ApiProperty({ example: 'Ahmed Al-Busaidi' })
  @IsString()
  @MaxLength(255)
  full_name: string;

  @ApiProperty({ example: '+96891234567' })
  @IsString()
  @MaxLength(50)
  phone: string;

  @ApiProperty({ example: 'DRV-12345', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  license_number?: string;

  @ApiProperty({ example: '2027-06-30', required: false })
  @IsOptional()
  @IsDateString()
  license_expiry?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8', required: false })
  @IsOptional()
  vehicle_id?: string;

  @ApiProperty({ example: 'available', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  status?: string = 'available';

  @ApiProperty({ example: 4.8, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  rating?: number = 0;
}