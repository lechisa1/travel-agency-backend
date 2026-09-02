import { IsOptional, IsString, Min, Max, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RoleQueryDto {
  @ApiProperty({ example: 'Admin', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 10, required: false })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiProperty({ example: 0, required: false })
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;
}
