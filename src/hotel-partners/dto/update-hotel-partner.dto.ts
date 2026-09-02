import { PartialType } from '@nestjs/mapped-types';
import { CreateHotelPartnerDto } from './create-hotel-partner.dto';

export class UpdateHotelPartnerDto extends PartialType(CreateHotelPartnerDto) {}