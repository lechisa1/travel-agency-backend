import {
  IsString,
  IsOptional,
  IsEmail,
  IsUrl,
  IsDateString,
  IsNumber,
  IsIn,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ example: 'Emirates Holidays LLC' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'hotel' })
  @IsString()
  @IsIn([
    'hotel',
    'airline',
    'transfer',
    'tour_operator',
    'insurance',
    'visa_agent',
    'restaurant',
    'other',
  ])
  type: string;

  @ApiProperty({ example: 'John Smith', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  contact_person?: string;

  @ApiProperty({ example: 'sales@emirates-holidays.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ example: '+97112345678', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  phone?: string;

  @ApiProperty({ example: 'PO Box 12345, Dubai, UAE', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'United Arab Emirates', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiProperty({ example: 'TRN-12345', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  tax_number?: string;

  @ApiProperty({ example: 10.0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  commission_rate?: number = 0;

  @ApiProperty({ example: 'Net 30', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  payment_terms?: string;

  @ApiProperty({ example: '2026-01-01', required: false })
  @IsOptional()
  @IsDateString()
  contract_start_date?: string;

  @ApiProperty({ example: '2026-12-31', required: false })
  @IsOptional()
  @IsDateString()
  contract_end_date?: string;

  @ApiProperty({ example: 'pending', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['active', 'pending', 'suspended', 'terminated'])
  status?: string = 'pending';

  @ApiProperty({ example: 4.5, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  rating?: number;

  @ApiProperty({ example: 'Preferred hotel partner', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}