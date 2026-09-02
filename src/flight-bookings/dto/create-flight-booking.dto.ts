import {
  IsString,
  IsOptional,
  IsUUID,
  IsNumber,
  IsDateString,
  MaxLength,
  Min,
  IsPositive,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
export class CreateFlightBookingDto {
  @ApiProperty({ example: 'PNR1234567890' })
  @IsString()
  @MaxLength(20)
  pnr: string;

  @ApiProperty({ example: '26eb4771-1297-46bc-857f-e25803a29aa1' })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiProperty({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsOptional()
  @IsUUID()
  staff_id?: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-g1h2-i3j4k5l6m7n8' })
  @IsOptional()
  @IsUUID()
  airline_id?: string;

  @ApiProperty({ example: 'JFK' })
  @IsString()
  @MaxLength(10)
  route_from: string;

  @ApiProperty({ example: 'LAX' })
  @IsString()
  @MaxLength(10)
  route_to: string;

  @ApiProperty({ example: '2023-10-10' })
  @IsDateString()
  travel_date: string;

  @ApiProperty({ example: 'Economy' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  class?: string = 'Economy';

  @ApiProperty({ example: 'TK123456' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  ticket_number?: string;

  @ApiProperty({ example: 500.0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  fare: number;

  @ApiProperty({ example: 50.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  tax?: number = 0;

  @ApiProperty({ example: 25.0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  service_charge?: number = 0;

  @ApiProperty({ example: 'pending' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string = 'pending';

  @ApiProperty({ example: '2023-10-10' })
  @IsOptional()
  @IsDateString()
  booking_date?: string;
}
