import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransferTypeDto {
  @ApiProperty({ example: 'Airport Pickup' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: 'Pickup from airport to hotel', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}