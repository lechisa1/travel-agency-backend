import { PartialType } from '@nestjs/mapped-types';
import { CreateVisaApplicationDto } from './create-visa-application.dto';

export class UpdateVisaApplicationDto extends PartialType(
  CreateVisaApplicationDto,
) {}