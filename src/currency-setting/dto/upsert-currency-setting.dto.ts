import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  IsIn,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertCurrencySettingDto {
  @ApiProperty({ example: 'OMR' })
  @IsString()
  @MaxLength(3)
  base_currency: string;

  @ApiProperty({ example: '﷼', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  symbol?: string;

  @ApiProperty({ example: 3, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  decimal_places?: number = 2;

  @ApiProperty({ example: 'DD/MM/YYYY', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['DD/MM/YYYY', 'MM/DD/YYYY', 'YYYY-MM-DD'])
  date_format?: string = 'DD/MM/YYYY';

  @ApiProperty({ example: 'Asia/Muscat', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  timezone?: string = 'UTC';

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  auto_update_rates?: boolean = true;
}