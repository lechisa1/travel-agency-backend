import {
  IsString,
  IsOptional,
  IsUUID,
  IsDateString,
  IsInt,
  IsNumber,
  IsIn,
  IsArray,
  ValidateNested,
  Min,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupMemberDto {
  @ApiProperty({ example: '26eb4771-1297-46bc-857f-e25803a29aa1', required: false })
  @IsOptional()
  @IsUUID()
  customer_id?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  is_leader?: boolean = false;
}

export class CreateGroupBookingDto {
  @ApiProperty({ example: 'Smith Family Umrah Group' })
  @IsString()
  @MaxLength(255)
  group_name: string;

  @ApiProperty({ example: '26eb4771-1297-46bc-857f-e25803a29aa1', required: false })
  @IsOptional()
  @IsUUID()
  leader_id?: string;

  @ApiProperty({ example: 'd1e2f3a4-b5c6-7890-h1i2-j3k4l5m6n7o8', required: false })
  @IsOptional()
  @IsUUID()
  package_id?: string;

  @ApiProperty({ example: 25, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  total_pax?: number;

  @ApiProperty({ example: 50000.0, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  total_amount?: number;

  @ApiProperty({ example: 'pending', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'confirmed', 'cancelled', 'completed'])
  status?: string = 'pending';

  @ApiProperty({ example: '2026-12-15', required: false })
  @IsOptional()
  @IsDateString()
  travel_date?: string;

  @ApiProperty({ type: [CreateGroupMemberDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGroupMemberDto)
  members?: CreateGroupMemberDto[];
}