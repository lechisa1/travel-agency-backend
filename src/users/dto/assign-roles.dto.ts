import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AssignRolesDto {
  @ApiProperty({
    example: [
      'e5d908fa-35e9-42b6-971d-34ca37ebc494',
      '5dfa4cd5-7e5b-4021-b90d-3fc6620481ca',
    ],
    description: 'List of role UUIDs',
    required: true,
  })
  @IsArray()
  @IsUUID('4', { each: true })
  role_ids: string[];
}
