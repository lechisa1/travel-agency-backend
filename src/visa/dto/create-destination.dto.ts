import {
  IsString,
  IsOptional,
  MaxLength,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDestinationDto {
  @ApiProperty({ example: 'Dubai' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'United Arab Emirates' })
  @IsString()
  @MaxLength(100)
  country: string;

  @ApiProperty({ example: 'Abu Dhabi', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  embassy_city?: string;
}