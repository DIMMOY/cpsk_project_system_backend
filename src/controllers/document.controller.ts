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
  Req,
  Res,
} from '@nestjs/common';
import { Patch } from '@nestjs/common/decorators';
import { response } from 'express';
import { request } from 'http';
import { Types } from 'mongoose';
import {
  ClassHasDocumentBodyDto,
  ClassHasDocumentStatusBodyDto,
} from 'src/dto/classHasDocument.dto';
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
    private readonly projectSendDocumentService: ProjectSendDocumentService,
  ) {}

  @Get(defaultPath)
  async listDocument(@Query('sort') sort: string, @Res() response) {
    const res = await this.documentService.list(sort, {});
    response.status(res.statusCode).send(res);
  }

  @Get(`class/:id/${defaultPath}`)
  async listDocumentInClass(
    @Param('id') classId: string,
    @Query('sort') sort: string,
    @Query('status') status: string,
    @Res() response,
  ) {
    const documents = await this.documentService.list(sort, {
      deletedAt: null,
    });
    if (documents.statusCode !== 200)
      return response.status(documents.statusCode).send(documents);
    const classHasDocuments = await this.classHasDocumentService.list(sort, {
      classId: toMongoObjectId({ value: classId, key: 'classId' }),
      deletedAt: null,
      status: true,
    });
    if (classHasDocuments.statusCode !== 200)
      return response
        .status(classHasDocuments.statusCode)
        .send(classHasDocuments);

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
    response.status(200).send({
      statusCode: documents.statusCode,
      message: documents.message,
      data: filterData,
    });
  }

  @Get(`class/:classId/project/:projectId/${defaultPath}`)
  async listSendDocumentInClass(
    @Param('classId') classId: string,
    @Param('projectId') projectId: string,
    @Query('sort') sort: string,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });
    // เช็ค project กับ userId ว่ามีสามารถเข้าถึงได้มั๊ยกรณีเป็น student กับ advisor
    // ไว้กลับมาทำหลัง สร้าง table user_has_project

    // find class has document
    const classHasDocuments = await this.classHasDocumentService.list(sort, {
      classId: toMongoObjectId({ value: classId, key: 'classId' }),
      deletedAt: null,
      status: true,
    });
    if (classHasDocuments.statusCode !== 200)
      return response
        .status(classHasDocuments.statusCode)
        .send(classHasDocuments);

    const documentIds = classHasDocuments.data.map(
      (e) => new Types.ObjectId(e.documentId._id),
    );

    // find project send document
    const projectSendDocument = await this.projectSendDocumentService.list(
      sort,
      {
        documentId: { $in: documentIds },
        projectId: toMongoObjectId({ value: projectId, key: 'projectId' }),
        deletedAt: null,
      },
    );
    if (projectSendDocument.statusCode !== 200)
      return response
        .status(projectSendDocument.statusCode)
        .send(projectSendDocument);

    // filter data
    const data = [];
    for (let i = 0; i < classHasDocuments.data.length; i++) {
      const {
        _id,
        documentId: documentIdData,
        endDate,
        startDate,
      } = classHasDocuments.data[i];
      const { _id: documentId, name, description } = documentIdData;
      const findData = projectSendDocument.data.find(
        (e) => e.documentId._id?.toString() === documentId?.toString(),
      );
      const sendStatus = findData
        ? findData.updatedAt.getTime() <= endDate.getTime()
          ? 1
          : 2
        : 0;
      data.push({
        _id,
        documentId,
        name,
        description,
        startDate,
        endDate,
        sentAt: findData ? findData.updatedAt : null,
        sendStatus,
      });
    }
    response.status(200).send({
      statusCode: classHasDocuments.statusCode,
      message: classHasDocuments.message,
      data,
    });
  }

  @Post(defaultPath)
  async createDocument(@Body() body: DocumentCreateDto, @Res() response) {
    const res = await this.documentService.create(body);
    response.status(res.statusCode).send(res);
  }

  @Put(`class/:classId/${defaultPath}/:documentId/date`)
  async setDateDocumentInClass(
    @Param('classId') classId: string,
    @Param('documentId') documentId: string,
    @Body() body: ClassHasDocumentBodyDto,
    @Res() response,
  ) {
    const res = await this.classHasDocumentService.createOrUpdate({
      ...body,
      classId,
      documentId,
    });
    response.status(res.statusCode).send(res);
  }

  @Put(`${defaultPath}/:id`)
  async updateDocument(
    @Param('id') id: string,
    @Body() body: DocumentUpdateDto,
    @Res() response,
  ) {
    const res = await this.documentService.update(id, body);
    response.status(res.statusCode).send(res);
  }

  @Patch(`class/:classId/${defaultPath}/:documentId/date/status`)
  async changeMeetingScheduleInClass(
    @Param('classId') classId: string,
    @Param('documentId') documentId: string,
    @Body() body: ClassHasDocumentStatusBodyDto,
    @Res() response,
  ) {
    const res = await this.classHasDocumentService.updateStatus({
      ...body,
      classId,
      documentId,
    });
    response.status(res.statusCode).send(res);
  }

  @Delete(`${defaultPath}/:id`)
  async deleteDocument(@Param('id') id: string, @Res() response) {
    const res = await this.documentService.delete(id);
    response.status(res.statusCode).send(res);
  }
}
