import { Module } from '@nestjs/common';
import { TransferTypesService } from './transfer-types.service';
import { TransferTypesController } from './transfer-types.controller';

@Module({
  providers: [TransferTypesService],
  controllers: [TransferTypesController],
  exports: [TransferTypesService],
})
export class TransferTypesModule {}