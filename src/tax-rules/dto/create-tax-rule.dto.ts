import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsDateString,
  IsIn,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaxRuleDto {
  @ApiProperty({ example: 'VAT 5%' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 5.0 })
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  rate: number;

  @ApiProperty({ example: 'percentage', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['percentage', 'fixed'])
  type?: string = 'percentage';

  @ApiProperty({ example: ['flight', 'hotel', 'package'], required: false })
  @IsOptional()
  applicable_to?: any;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  is_enabled?: boolean = true;

  @ApiProperty({ example: '2026-01-01', required: false })
  @IsOptional()
  @IsDateString()
  effective_from?: string;

  @ApiProperty({ example: '2026-12-31', required: false })
  @IsOptional()
  @IsDateString()
  effective_to?: string;
}