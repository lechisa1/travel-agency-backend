import { IsOptional, IsString, Min, Max, IsInt } from 'class-validator';
import { Type, Transform } from 'class-transformer';
export class RoleQueryDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  limit?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;
}
