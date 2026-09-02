import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateAirlineDto {
  @ApiProperty({ example: 'Delta Airlines' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'DA-2026' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'https://example.com/logo.png' })
  @IsOptional()
  logo_url?: string;
}
