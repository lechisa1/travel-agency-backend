import {
  IsOptional,
  IsString,
  IsUUID,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDocumentDto {
  @ApiProperty({ example: 'Passport Copy' })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({ example: 'a1b2c3d4-...', required: false })
  @IsOptional()
  @IsUUID()
  category_id?: string;

  @ApiProperty({ example: '2027-12-31', required: false })
  @IsOptional()
  @IsDateString()
  expiry_date?: string;

  @ApiProperty({ example: 'internal', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  access_level?: string = 'internal';
}

export class DocumentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty({ required: false })
  category_id?: string;

  @ApiProperty({ required: false })
  file_type?: string;

  @ApiProperty({ required: false })
  file_size?: number;

  @ApiProperty()
  file_url: string;

  @ApiProperty()
  version: number;

  @ApiProperty({ required: false })
  expiry_date?: Date;

  @ApiProperty({ required: false })
  uploaded_by?: string;

  @ApiProperty()
  access_level: string;

  @ApiProperty()
  created_at: Date;

  @ApiProperty()
  updated_at: Date;
}