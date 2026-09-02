import {
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsUUID,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class QueryPackageDto {
  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ example: 10, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @ApiProperty({ example: 'search-term', required: false })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    example: 'd1e2f3a4-b5c6-7890-h1i2-j3k4l5m6n7o8',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiProperty({ example: 'published', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  min_price?: number;

  @ApiProperty({ example: 10000, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  max_price?: number;
}
