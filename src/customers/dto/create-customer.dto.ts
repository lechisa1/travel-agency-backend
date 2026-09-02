import {
  IsString,
  IsOptional,
  IsEmail,
  IsBoolean,
  IsDateString,
  MaxLength,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MaxLength(255)
  full_name: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsString()
  @MaxLength(50)
  phone: string;

  @IsString()
  @MaxLength(100)
  nationality: string;

  @IsOptional()
  @IsDateString()
  date_of_birth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  passport_number?: string;

  @IsOptional()
  @IsDateString()
  passport_issue_date?: string;

  @IsOptional()
  @IsDateString()
  passport_expiry_date?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  issue_country?: string;

  @IsOptional()
  @IsBoolean()
  is_vip?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  status?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
