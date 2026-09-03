import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCalendarEventTypeDto {
  @ApiProperty({ example: 'Meeting' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ example: '#3b82f6', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  color?: string;
}