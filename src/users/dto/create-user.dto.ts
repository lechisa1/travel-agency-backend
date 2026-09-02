import {
  IsString,
  IsOptional,
  IsUUID,
  IsEmail,
  IsArray,
  MinLength,
  MaxLength,
  IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  @MaxLength(100)
  password: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  full_name: string;

  @ApiProperty({ example: '+1234567890' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(14)
  phone?: string;

  @ApiProperty({
    example: [
      'e5d908fa-35e9-42b6-971d-34ca37ebc494',
      '5dfa4cd5-7e5b-4021-b90d-3fc6620481ca',
    ],
    description: 'List of role UUIDs',
    required: false,
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value) as string[];
      } catch {
        return [value];
      }
    }
    return value as string[];
  })
  @IsUUID('4', { each: true })
  role_ids?: string[];

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsUrl()
  avatar_url?: string;
}
