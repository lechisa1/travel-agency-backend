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
export class QueryFlightBookingDto {
  @ApiProperty({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ example: 'search-term' })
  @IsOptional()
  @IsString()
  search?: string; // Searches pnr, booking_reference, or ticket_number

  @ApiProperty({ example: '26eb4771-1297-46bc-857f-e25803a29aa1' })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8' })
  @IsOptional()
  @IsUUID()
  airline_id?: string;

  @ApiProperty({ example: 'pending' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: '2023-10-10' })
  @IsOptional()
  @IsDateString()
  from_date?: string;

  @ApiProperty({ example: '2023-10-10' })
  @IsOptional()
  @IsDateString()
  to_date?: string;
}
