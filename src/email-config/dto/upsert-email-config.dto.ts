import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEmail,
  IsIn,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpsertEmailConfigDto {
  @ApiProperty({ example: 'smtp.gmail.com', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  smtp_host?: string;

  @ApiProperty({ example: '587', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  smtp_port?: string;

  @ApiProperty({ example: 'noreply@almaha.travel', required: false })
  @IsOptional()
  @IsEmail()
  sender_email?: string;

  @ApiProperty({ example: 'Al Maha Travel', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sender_name?: string;

  @ApiProperty({ example: 'tls', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['none', 'ssl', 'tls', 'starttls'])
  encryption?: string;

  @ApiProperty({ example: '<encrypted-secret>', required: false })
  @IsOptional()
  @IsString()
  api_key_encrypted?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_active?: boolean = false;
}