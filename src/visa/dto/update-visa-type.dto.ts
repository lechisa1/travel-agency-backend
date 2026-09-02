import { PartialType } from '@nestjs/mapped-types';
import { CreateVisaTypeDto } from './create-visa-type.dto';

export class UpdateVisaTypeDto extends PartialType(CreateVisaTypeDto) {}