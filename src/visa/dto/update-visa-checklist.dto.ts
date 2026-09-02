import { PartialType } from '@nestjs/mapped-types';
import { CreateVisaChecklistDto } from './create-visa-checklist.dto';

export class UpdateVisaChecklistDto extends PartialType(
  CreateVisaChecklistDto,
) {}