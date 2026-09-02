import { IsString, IsOptional, IsInt, Max, Min } from 'class-validator';

export class PermissionQueryDto {
  @IsInt()
  @Min(0)
  @Max(100)
  @IsOptional()
  limit?: number;

  @IsInt()
  @Min(0)
  @IsOptional()
  offset?: number;

  @IsString()
  @IsOptional()
  search?: string;
}
