import { IsOptional, IsString, Min, Max, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class RoleQueryDto {
  @ApiProperty({ example: 'Admin' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 10 })
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  limit?: number;

  @ApiProperty({ example: 0 })
  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;
}
