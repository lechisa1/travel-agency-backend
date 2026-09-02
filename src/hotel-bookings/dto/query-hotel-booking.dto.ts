import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryHotelBookingDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ example: 'search-term', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ example: '26eb4771-1297-46bc-857f-e25803a29aa1', required: false })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8', required: false })
  @IsOptional()
  @IsUUID()
  hotel_partner_id?: string;

  @ApiProperty({ example: 'd1e2f3a4-b5c6-7890-h1i2-j3k4l5m6n7o8', required: false })
  @IsOptional()
  @IsUUID()
  room_type_id?: string;

  @ApiProperty({ example: 'tentative', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: '2026-01-01', required: false })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiProperty({ example: '2026-12-31', required: false })
  @IsOptional()
  @IsDateString()
  to_date?: string;
}