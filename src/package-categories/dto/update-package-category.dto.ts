import { PartialType } from '@nestjs/mapped-types';
import { CreatePackageCategoryDto } from './create-package-category.dto';

export class UpdatePackageCategoryDto extends PartialType(
  CreatePackageCategoryDto,
) {}