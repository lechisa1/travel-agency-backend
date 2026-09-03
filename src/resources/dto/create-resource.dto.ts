import { IsString, IsOptional, IsIn, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateResourceDto {
  @ApiProperty({ example: 'Conference Room A' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'meeting_room' })
  @IsString()
  @IsIn([
    'meeting_room',
    'simulator',
    'training_room',
    'equipment',
    'kiosk',
    'lounge',
    'other',
  ])
  type: string;

  @ApiProperty({ example: 'available', required: false })
  @IsOptional()
  @IsString()
  @IsIn(['available', 'in_use', 'maintenance', 'unavailable'])
  status?: string = 'available';
}