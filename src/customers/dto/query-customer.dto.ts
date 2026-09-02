import { IsOptional, IsInt, Min, IsString, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
export class QueryCustomerDto {
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
  search?: string; // Searches full_name, email, phone, passport_number

  @ApiProperty({ example: 'active', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 'US', required: false })
  @IsOptional()
  @IsString()
  nationality?: string;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  is_vip?: boolean;
}
