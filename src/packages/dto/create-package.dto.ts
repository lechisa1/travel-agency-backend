import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsInt,
  IsUrl,
  Min,
  IsIn,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePackageDto {
  @ApiProperty({ example: 'Maldives 5-Night Honeymoon' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'd1e2f3a4-b5c6-7890-h1i2-j3k4l5m6n7o8', required: false })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiProperty({ example: '5 nights in an overwater villa with all meals', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['Flights', 'Hotel', 'Transfers', 'Breakfast'], required: false })
  @IsOptional()
  inclusions?: any;

  @ApiProperty({ example: ['Personal expenses', 'Tips'], required: false })
  @IsOptional()
  exclusions?: any;

  @ApiProperty({ example: 2500.0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  base_price: number;

  @ApiProperty({ example: 5, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  duration_days?: number;

  @ApiProperty({ example: 4, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  max_pax?: number;

  @ApiProperty({ example: 'https://cdn.example.com/pkg.jpg', required: false })
  @IsOptional()
  @IsUrl()
  image_url?: string;

  @ApiProperty({ example: 'draft', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['draft', 'published', 'archived'])
  status?: string = 'draft';
}