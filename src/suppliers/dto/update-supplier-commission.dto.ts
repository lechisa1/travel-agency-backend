import { PartialType } from '@nestjs/mapped-types';
import { CreateSupplierCommissionDto } from './create-supplier-commission.dto';

export class UpdateSupplierCommissionDto extends PartialType(
  CreateSupplierCommissionDto,
) {}