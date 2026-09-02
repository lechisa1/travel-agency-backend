import { IsOptional, IsInt, Min, IsString, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

export class QueryCustomerDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;

  @IsOptional()
  @IsString()
  search?: string; // Searches full_name, email, phone, passport_number

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  nationality?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  is_vip?: boolean;
}
