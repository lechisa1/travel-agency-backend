import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateVisaChecklistDto } from './dto/create-visa-checklist.dto';
import { UpdateVisaChecklistDto } from './dto/update-visa-checklist.dto';

@Injectable()
export class VisaChecklistsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateVisaChecklistDto) {
    const application = await this.prisma.visaApplication.findUnique({
      where: { id: dto.visa_application_id },
    });
    if (!application) {
      throw new NotFoundException(
        `Visa application with ID ${dto.visa_application_id} not found`,
      );
    }

    return this.prisma.visaDocumentChecklist.create({
      data: {
        visa_application_id: dto.visa_application_id,
        name: dto.name,
        is_required: dto.is_required ?? true,
        is_uploaded: dto.is_uploaded ?? false,
        document_id: dto.document_id,
      },
      include: {
        document: {
          select: { id: true, title: true, file_url: true, file_type: true },
        },
      },
    });
  }

  async findByApplication(visaApplicationId: string) {
    return this.prisma.visaDocumentChecklist.findMany({
      where: { visa_application_id: visaApplicationId },
      orderBy: { name: 'asc' },
      include: {
        document: {
          select: { id: true, title: true, file_url: true, file_type: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const checklist = await this.prisma.visaDocumentChecklist.findUnique({
      where: { id },
      include: {
        document: {
          select: { id: true, title: true, file_url: true, file_type: true },
        },
      },
    });

    if (!checklist) {
      throw new NotFoundException(`Checklist item with ID ${id} not found`);
    }

    return checklist;
  }

  async update(id: string, dto: UpdateVisaChecklistDto) {
    await this.findOne(id);

    return this.prisma.visaDocumentChecklist.update({
      where: { id },
      data: {
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.is_required !== undefined && { is_required: dto.is_required }),
        ...(dto.is_uploaded !== undefined && { is_uploaded: dto.is_uploaded }),
        ...(dto.document_id !== undefined && { document_id: dto.document_id }),
      },
      include: {
        document: {
          select: { id: true, title: true, file_url: true, file_type: true },
        },
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.visaDocumentChecklist.delete({
      where: { id },
      select: { id: true, name: true },
    });
  }
}