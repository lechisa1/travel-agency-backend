import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePackageCategoryDto {
  @ApiProperty({ example: 'Honeymoon' })
  @IsString()
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: 'Couples and romantic getaways', required: false })
  @IsOptional()
  @IsString()
  description?: string;
}