import { Module } from '@nestjs/common';
import { VisaTypesService } from './visa-types.service';
import { VisaTypesController } from './visa-types.controller';
import { DestinationsService } from './destinations.service';
import { DestinationsController } from './destinations.controller';
import { VisaApplicationsService } from './visa-applications.service';
import { VisaApplicationsController } from './visa-applications.controller';
import { VisaChecklistsService } from './visa-checklists.service';
import { VisaChecklistsController } from './visa-checklists.controller';
import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [DocumentsModule],
  providers: [
    VisaTypesService,
    DestinationsService,
    VisaApplicationsService,
    VisaChecklistsService,
  ],
  controllers: [
    VisaTypesController,
    DestinationsController,
    VisaApplicationsController,
    VisaChecklistsController,
  ],
  exports: [
    VisaTypesService,
    DestinationsService,
    VisaApplicationsService,
    VisaChecklistsService,
  ],
})
export class VisaModule {}