import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoomTypeDto {
  @ApiProperty({ example: 'Deluxe Suite' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'King bed, sea view, balcony', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'bed', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  icon?: string;
}