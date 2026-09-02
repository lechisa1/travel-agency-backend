import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVisaTypeDto {
  @ApiProperty({ example: 'Tourist Visa' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Short-term visa for tourism and leisure', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}