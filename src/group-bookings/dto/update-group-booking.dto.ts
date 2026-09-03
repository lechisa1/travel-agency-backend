import { PartialType } from '@nestjs/mapped-types';
import { CreateGroupBookingDto } from './create-group-booking.dto';

export class UpdateGroupBookingDto extends PartialType(CreateGroupBookingDto) {}