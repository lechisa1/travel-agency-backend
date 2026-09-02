import {
  IsString,
  IsOptional,
  IsBoolean,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVisaChecklistDto {
  @ApiProperty({ example: 'e1f2g3h4-i5j6-7890-k1l2-m3n4o5p6q7r8' })
  @IsUUID()
  visa_application_id: string;

  @ApiProperty({ example: 'Passport Copy' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_required?: boolean = true;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_uploaded?: boolean = false;

  @ApiProperty({ example: 'd1e2f3a4-b5c6-7890-h1i2-j3k4l5m6n7o8', required: false })
  @IsOptional()
  @IsUUID()
  document_id?: string;
}