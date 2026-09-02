import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiBearerAuth, ApiTags, ApiConsumes, ApiBody, ApiOperation } from '@nestjs/swagger';
import { VisaChecklistsService } from './visa-checklists.service';
import { DocumentsService } from '../documents/documents.service';
import { CreateVisaChecklistDto } from './dto/create-visa-checklist.dto';
import { UpdateVisaChecklistDto } from './dto/update-visa-checklist.dto';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('Visa - Document Checklist')
@ApiBearerAuth()
@Controller('visa/checklists')
export class VisaChecklistsController {
  constructor(
    private readonly visaChecklistsService: VisaChecklistsService,
    private readonly documentsService: DocumentsService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() dto: CreateVisaChecklistDto) {
    return this.visaChecklistsService.create(dto);
  }

  /**
   * Upload a document file via Swagger multipart and link it to the checklist item.
   * The file is persisted as a Document row, then attached to the checklist via document_id
   * and marked is_uploaded=true.
   */
  @Post(':id/upload')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Upload the document file for a checklist item (Swagger multipart)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        category_id: { type: 'string', format: 'uuid' },
        access_level: { type: 'string' },
      },
      required: ['file'],
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: path.resolve(process.cwd(), 'uploads', '_tmp'),
        filename: (_req, file, cb) => {
          const ext = path.extname(file.originalname);
          cb(null, `${uuidv4()}${ext}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { category_id?: string; access_level?: string },
  ) {
    if (!file) {
      throw new BadRequestException('No file provided (field name: "file")');
    }
    const checklist = await this.visaChecklistsService.findOne(id);
    const doc = await this.documentsService.upload(
      file,
      {
        title: checklist.name,
        category_id: body.category_id,
        access_level: body.access_level ?? 'internal',
      },
    );
    return this.visaChecklistsService.update(id, {
      document_id: doc.id,
      is_uploaded: true,
    });
  }

  @Get()
  findByApplication(
    @Query('visa_application_id', ParseUUIDPipe) visaApplicationId: string,
  ) {
    return this.visaChecklistsService.findByApplication(visaApplicationId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.visaChecklistsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateVisaChecklistDto,
  ) {
    return this.visaChecklistsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.visaChecklistsService.remove(id);
  }
}