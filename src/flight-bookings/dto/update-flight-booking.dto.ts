import { PartialType } from '@nestjs/mapped-types';
import { CreateFlightBookingDto } from './create-flight-booking.dto';

export class UpdateFlightBookingDto extends PartialType(
  CreateFlightBookingDto,
) {}
