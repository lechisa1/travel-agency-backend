import { IsArray, IsUUID, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ example: 'Admin' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'Administrator role with full access' })
  @IsString()
  @IsOptional()
  description: string;
  @ApiProperty({
    example: [
      'e5d908fa-35e9-42b6-971d-34ca37ebc494',
      '5dfa4cd5-7e5b-4021-b90d-3fc6620481ca',
    ],
    description: 'List of permission UUIDs',
    required: false,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  permission_ids?: string[];
}
