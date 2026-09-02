import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDocumentDto, DocumentResponseDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

@Injectable()
export class DocumentsService {
  private readonly uploadRoot = path.resolve(process.cwd(), 'uploads');

  constructor(private readonly prisma: PrismaService) {
    if (!fs.existsSync(this.uploadRoot)) {
      fs.mkdirSync(this.uploadRoot, { recursive: true });
    }
  }

  async upload(
    file: UploadedFile,
    meta: CreateDocumentDto,
    userId?: string,
  ): Promise<DocumentResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided (field name: "file")');
    }

    const subfolder = meta.category_id
      ? path.join(this.uploadRoot, meta.category_id)
      : path.join(this.uploadRoot, 'uncategorized');
    if (!fs.existsSync(subfolder)) {
      fs.mkdirSync(subfolder, { recursive: true });
    }

    const ext = path.extname(file.originalname) || '';
    const storedName = `${uuidv4()}${ext}`;
    const finalPath = path.join(subfolder, storedName);
    fs.renameSync(file.path, finalPath);

    const relativeUrl = `/uploads/${
      meta.category_id ? meta.category_id + '/' : 'uncategorized/'
    }${storedName}`;

    const document = await this.prisma.document.create({
      data: {
        title: meta.title,
        category_id: meta.category_id,
        file_type: file.mimetype,
        file_size: file.size,
        file_url: relativeUrl,
        expiry_date: meta.expiry_date ? new Date(meta.expiry_date) : undefined,
        uploaded_by: userId,
        access_level: meta.access_level ?? 'internal',
      },
    });

    return this.toResponse(document);
  }

  async findAll(categoryId?: string) {
    const where = categoryId ? { category_id: categoryId } : undefined;
    const docs = await this.prisma.document.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });
    return docs.map((d) => this.toResponse(d));
  }

  async findOne(id: string): Promise<DocumentResponseDto> {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }
    return this.toResponse(document);
  }

  async update(
    id: string,
    dto: UpdateDocumentDto,
  ): Promise<DocumentResponseDto> {
    await this.findOne(id);
    const updated = await this.prisma.document.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.category_id !== undefined && { category_id: dto.category_id }),
        ...(dto.expiry_date !== undefined && {
          expiry_date: new Date(dto.expiry_date),
        }),
        ...(dto.access_level !== undefined && {
          access_level: dto.access_level,
        }),
      },
    });
    return this.toResponse(updated);
  }

  async remove(id: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${id} not found`);
    }

    const absolutePath = path.resolve(process.cwd(), doc.file_url.replace(/^\//, ''));
    if (fs.existsSync(absolutePath)) {
      try {
        fs.unlinkSync(absolutePath);
      } catch {
        // best-effort cleanup
      }
    }

    await this.prisma.document.delete({ where: { id } });
    return { id, title: doc.title };
  }

  private toResponse(doc: any): DocumentResponseDto {
    return {
      id: doc.id,
      title: doc.title,
      category_id: doc.category_id ?? undefined,
      file_type: doc.file_type ?? undefined,
      file_size: doc.file_size ?? undefined,
      file_url: doc.file_url,
      version: doc.version,
      expiry_date: doc.expiry_date ?? undefined,
      uploaded_by: doc.uploaded_by ?? undefined,
      access_level: doc.access_level,
      created_at: doc.created_at,
      updated_at: doc.updated_at,
    };
  }
}