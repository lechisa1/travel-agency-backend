import { IsOptional, IsString, Min, Max, IsInt } from 'class-validator';
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
