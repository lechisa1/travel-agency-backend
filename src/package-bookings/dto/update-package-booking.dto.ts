import { PartialType } from '@nestjs/mapped-types';
import { CreatePackageBookingDto } from './create-package-booking.dto';

export class UpdatePackageBookingDto extends PartialType(
  CreatePackageBookingDto,
) {}