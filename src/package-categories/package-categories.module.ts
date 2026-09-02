import { Module } from '@nestjs/common';
import { PackageCategoriesService } from './package-categories.service';
import { PackageCategoriesController } from './package-categories.controller';

@Module({
  providers: [PackageCategoriesService],
  controllers: [PackageCategoriesController],
  exports: [PackageCategoriesService],
})
export class PackageCategoriesModule {}