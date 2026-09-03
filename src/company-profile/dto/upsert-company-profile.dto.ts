import {
  IsString,
  IsOptional,
  IsUrl,
  IsEmail,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertCompanyProfileDto {
  @ApiProperty({ example: 'Al Maha Travel & Tourism LLC' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: '123 Airport Road, Muscat', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Muscat', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiProperty({ example: 'Oman', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ example: '+96812345678', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ example: 'info@almaha.travel', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: 'https://almaha.travel', required: false })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiProperty({ example: 'TRVL-2026-001', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  license_number?: string;

  @ApiProperty({ example: 'OM1234567890', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tax_number?: string;

  @ApiProperty({ example: 'https://cdn.example.com/logo.png', required: false })
  @IsOptional()
  @IsUrl()
  logo_url?: string;
}