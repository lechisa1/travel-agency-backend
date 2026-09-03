import { IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupMemberInlineDto {
  @ApiProperty({ example: '26eb4771-1297-46bc-857f-e25803a29aa1', required: false })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  is_leader?: boolean = false;
}