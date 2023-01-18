import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import e from 'express';
import { Types } from 'mongoose';
import { ClassHasDocumentCreateDto } from 'src/dto/classHasDocument.dto';
import { DocumentCreateDto, DocumentUpdateDto } from 'src/dto/document.dto';
import { ClassHasDocumentService } from 'src/services/classHasDocument.service';
import { DocumentService } from 'src/services/document.service';
import { ProjectSendDocumentService } from 'src/services/projectSendDocument.service';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

const defaultPath = 'document';

@Controller()
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly classHasDocumentService: ClassHasDocumentService,
    private readonly userSendDocumentService: ProjectSendDocumentService,
  ) {}

  @Get(defaultPath)
  @HttpCode(200)
  async listDocument(@Query('sort') sort: string) {
    return await this.documentService.list(sort, {});
  }

  @Get(`class/:id/${defaultPath}`)
  @HttpCode(200)
  async listDocumentInClass(
    @Param('id') classId: string,
    @Query('sort') sort: string,
    @Query('status') status: string,
  ) {
    const documents = await this.documentService.list(sort, {
      deletedAt: null,
    });
    if (documents.statusCode !== 200) return documents;
    const classHasDocuments = await this.classHasDocumentService.list(sort, {
      classId: toMongoObjectId({ value: classId, key: 'classId' }),
      deletedAt: null,
    });
    if (classHasDocuments.statusCode !== 200) return classHasDocuments;

    // filter data
    const data = [];
    for (let i = 0; i < documents.data.length; i++) {
      const { _id, name, description, status, createdAt, updatedAt } =
        documents.data[i];
      const findData = classHasDocuments.data.find(
        (e) => e.documentId._id?.toString() === _id?.toString(),
      );
      const statusInClass = findData ? true : false;
      const startDate = findData ? findData.startDate : null;
      const endDate = findData ? findData.endDate : null;
      const openedAt = findData ? findData.updatedAt : null;
      data.push({
        _id,
        name,
        description,
        status,
        createdAt,
        updatedAt,
        statusInClass,
        openedAt,
        startDate,
        endDate,
      });
    }
    const filterData =
      status === 'true'
        ? data.filter((e) => e.statusInClass === true)
        : status === 'false'
        ? data.filter((e) => e.statusInClass === false)
        : data;
    // ==========
    return {
      statusCode: documents.statusCode,
      message: documents.message,
      data: filterData,
    };
  }

  @Post(defaultPath)
  @HttpCode(201)
  async createDocument(@Body() body: DocumentCreateDto) {
    return await this.documentService.create(body);
  }

  @Post(`class/:id/${defaultPath}`)
  async setDateDocumentInClass(@Body() body: ClassHasDocumentCreateDto) {
    return await this.classHasDocumentService.createOrUpdate(body);
  }

  @Put(`${defaultPath}/:id`)
  @HttpCode(200)
  async updateDocument(
    @Param('id') id: string,
    @Body() body: DocumentUpdateDto,
  ) {
    return await this.documentService.update(id, body);
  }

  @Delete(`${defaultPath}/:id`)
  @HttpCode(200)
  async deleteDocument(@Param('id') id: string) {
    return await this.documentService.delete(id);
  }
}
