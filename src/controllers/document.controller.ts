import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Patch } from '@nestjs/common/decorators';
import { Types } from 'mongoose';
import { FRONT_END_URL } from 'src/config';
import {
  ClassHasDocumentBodyDto,
  ClassHasDocumentStatusBodyDto,
} from 'src/dto/classHasDocument.dto';
import { DocumentCreateDto, DocumentUpdateDto } from 'src/dto/document.dto';
import { ProjectSendDocumenteBodyDto } from 'src/dto/projectSendDocument.dto';
import { ClassHasDocumentService } from 'src/services/classHasDocument.service';
import { DocumentService } from 'src/services/document.service';
import { ProjectService } from 'src/services/project.service';
import { ProjectHasUserService } from 'src/services/projectHasUser.service';
import { ProjectSendDocumentService } from 'src/services/projectSendDocument.service';
import { UserJoinClassService } from 'src/services/userJoinClass.service';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';
import { sendNotification } from 'src/utils/notification.utils';

const defaultPath = 'document';

@Controller()
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly classHasDocumentService: ClassHasDocumentService,
    private readonly projectSendDocumentService: ProjectSendDocumentService,
    private readonly projectHasUserService: ProjectHasUserService,
    private readonly projectService: ProjectService,
    private readonly userJoinClassService: UserJoinClassService,
  ) {}

  @Get(defaultPath)
  async listDocument(@Query('sort') sort: string, @Res() response) {
    const res = await this.documentService.list(sort, { deletedAt: null });
    response.status(res.statusCode).send(res);
  }

  @Get(`class/:classId/${defaultPath}`)
  async listDocumentInClass(
    @Param('classId') classId: string,
    @Query('sort') sort: string,
    @Query('status') status: string,
    @Req() request,
    @Res() response,
  ) {
    const { role } = request;
    // if not admin, can find only status is true
    if (!role.find((e) => e === 2) && status !== 'true')
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

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

  @Get(`class/:classId/project/:projectId/${defaultPath}/:documentId/detail`)
  async getSendDocumentDetail(
    @Param('classId') classId: string,
    @Param('documentId') documentId: string,
    @Param('projectId') projectId: string,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    const { role } = request;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    // เช็ค project กับ userId ว่ามีสามารถเข้าถึงได้มั๊ยกรณีเป็น student กับ advisor
    if (!role.find((e) => e === 2)) {
      const findUser = await this.projectHasUserService.findOne({
        projectId: toMongoObjectId({
          value: projectId,
          key: 'projectId',
        }),
        userId,
        classId: toMongoObjectId({
          value: classId,
          key: 'classId',
        }),
        isAccept: true,
        deletedAt: null,
      });
      if (findUser.statusCode === 404)
        return response
          .status(403)
          .send({ statusCode: 403, message: 'Permission Denied' });
      else if (findUser.statusCode !== 200)
        return response.status(findUser.statusCode).send(findUser);
    }

    // find class has document id
    const documentResponse = await this.classHasDocumentService.findOne({
      classId: toMongoObjectId({
        value: classId,
        key: 'classId',
      }),
      documentId: toMongoObjectId({
        value: documentId,
        key: 'documentId',
      }),
      deletedAt: null,
    });
    if (documentResponse.statusCode !== 200)
      return response
        .status(documentResponse.statusCode)
        .send(documentResponse);

    const { startDate, endDate, _id } = documentResponse.data;
    const chdResponse = await this.projectSendDocumentService.findOne({
      classHasDocumentId: _id,
      projectId: toMongoObjectId({ value: projectId, key: 'projectId' }),
      deletedAt: null,
    });
    if (chdResponse.statusCode !== 200)
      return response.status(chdResponse.statusCode).send(chdResponse);

    const { data } = chdResponse;
    const sendStatus = data
      ? data.updatedAt.getTime() <= data.classHasDocumentId.endDate.getTime()
        ? 1
        : 2
      : 0;

    response.status(chdResponse.statusCode).send({
      statusCode: chdResponse.statusCode,
      message: chdResponse.message,
      data: {
        ...data?._doc,
        ...{ sendStatus, startDate, endDate },
        document: documentResponse.data.documentId?._doc,
      },
    });
  }

  @Get(`class/:classId/${defaultPath}/overview`)
  async listProjectSendDocumentInClass(
    @Param('classId') classId: string | Types.ObjectId,
    @Query('id') documentId: string | Types.ObjectId,
    @Query('sort') sort: string,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    const { role, currentRole } = request;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    classId = toMongoObjectId({ value: classId, key: 'classId' });

    let classHasDocumentId = null;
    let checkDocument;
    let document = null;
    if (documentId) {
      documentId = toMongoObjectId({ value: documentId, key: 'documentId' });
      checkDocument = await this.classHasDocumentService.findOne({
        classId,
        documentId,
        deletedAt: null,
        status: true,
      });
      if (checkDocument.statusCode !== 200)
        return response.status(checkDocument.statusCode).send(checkDocument);
      classHasDocumentId = checkDocument.data._id;
      document = checkDocument.data.documentId;
    } else {
      checkDocument = await this.classHasDocumentService.list('startDateASC', {
        classId,
        deletedAt: null,
        status: true,
      });
      if (checkDocument.statusCode !== 200)
        return response.status(checkDocument.statusCode).send(checkDocument);
      classHasDocumentId = { $in: checkDocument.data.map((e) => e._id) };
    }

    const projectsOb: any = {};

    const projects = await this.projectService.list('createdAtDESC', {
      classId,
      deletedAt: null,
    });
    if (projects.statusCode !== 200)
      return response.status(projects.statusCode).send(projects);

    // if not admin or current role is advisor
    let projectHasUsers;
    if (!role.find((e) => e === 2) || currentRole === 1) {
      projectHasUsers = await this.projectHasUserService.list({
        role: 2,
        userId,
        classId,
        deletedAt: null,
      });
      if (projectHasUsers.statusCode !== 200)
        return response
          .status(projectHasUsers.statusCode)
          .send(projectHasUsers);
      projects.data
        .filter((project) =>
          projectHasUsers.data.find(
            (p) => p.projectId.toString() === project._id.toString(),
          ),
        )
        .forEach((project) => {
          projectsOb[project._id] = {
            ...project._doc,
            document: [],
            students: [],
          };
        });
    } else {
      projects.data.forEach((project) => {
        projectsOb[project._id] = {
          ...project._doc,
          document: [],
          students: [],
        };
      });
    }

    const findSendDocument = await this.projectSendDocumentService.list(
      'createdAtASC',
      {
        classHasDocumentId,
        deletedAt: null,
      },
    );
    if (findSendDocument.statusCode !== 200)
      return response
        .status(findSendDocument.statusCode)
        .send(findSendDocument);

    const studentInClass = await this.projectHasUserService.list({
      classId,
      role: { $in: [0, 1] },
      deletedAt: null,
    });
    if (studentInClass.statusCode !== 200)
      response.status(studentInClass.statusCode).send(studentInClass);

    findSendDocument.data.forEach((data) => {
      const sendStatus = data
        ? data.updatedAt.getTime() <= data.classHasDocumentId.endDate.getTime()
          ? 1
          : 2
        : 0;
      if (projectsOb[data.projectId]) {
        projectsOb[data.projectId].document.push({
          _id: data.classHasDocumentId.documentId,
          sendStatus,
        });
      }
    });

    studentInClass.data.forEach((data) => {
      if (projectsOb[data.projectId]) {
        projectsOb[data.projectId].students.push(data.userId);
      }
    });

    response.status(findSendDocument.statusCode).send({
      statusCode: findSendDocument.statusCode,
      message: findSendDocument.message,
      data: document
        ? { document, project: Object.values(projectsOb) }
        : { document: 'all', project: Object.values(projectsOb) },
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
    const { role } = request;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    // เช็ค project กับ userId ว่ามีสามารถเข้าถึงได้มั๊ยกรณีเป็น student กับ advisor
    if (!role.find((e) => e === 2)) {
      const findUser = await this.projectHasUserService.findOne({
        projectId: toMongoObjectId({
          value: projectId,
          key: 'projectId',
        }),
        userId,
        classId: toMongoObjectId({
          value: classId,
          key: 'classId',
        }),
        isAccept: true,
        deletedAt: null,
      });
      if (findUser.statusCode === 404)
        return response
          .status(403)
          .send({ statusCode: 403, message: 'Permission Denied' });
      else if (findUser.statusCode !== 200)
        return response.status(findUser.statusCode).send(findUser);
    }

    // find class has document
    const classHasDocuments = await this.classHasDocumentService.list(sort, {
      classId: toMongoObjectId({ value: classId, key: 'classId' }),
      startDate: { $lte: new Date() },
      deletedAt: null,
      status: true,
    });
    if (classHasDocuments.statusCode !== 200)
      return response
        .status(classHasDocuments.statusCode)
        .send(classHasDocuments);

    const classHasDocumentIds = classHasDocuments.data.map(
      (e) => new Types.ObjectId(e._id),
    );

    // find project send document
    const projectSendDocument = await this.projectSendDocumentService.list(
      sort,
      {
        classHasDocumentId: { $in: classHasDocumentIds },
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
        (e) => e.classHasDocumentId._id?.toString() === _id?.toString(),
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
        pathDocument: findData ? findData.pathDocument : [],
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

  @Post(`project/:projectId/${defaultPath}/:documentId`)
  async createSendDocument(
    @Param('projectId') projectId: string,
    @Param('documentId') documentId: string,
    @Body() body: ProjectSendDocumenteBodyDto,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    // เช็ค project กับ userId ว่ามีสามารถเข้าถึงได้มั๊ยกรณีเป็น student
    const findUser = await this.projectHasUserService.findOne({
      projectId: toMongoObjectId({
        value: projectId,
        key: 'projectId',
      }),
      userId,
      isAccept: true,
      deletedAt: null,
      role: { $in: [0, 1] }, //owner or partner
    });
    if (findUser.statusCode === 404)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });
    else if (findUser.statusCode !== 200)
      return response.status(findUser.statusCode).send(findUser);

    const res = await this.projectSendDocumentService.createOrUpdate({
      ...body,
      projectId,
      documentId,
    });
    response.status(res.statusCode).send(res);
  }

  @Put(`class/:classId/${defaultPath}/:documentId/date`)
  async setDateDocumentInClass(
    @Param('classId') classId: string,
    @Param('documentId') documentId: string,
    @Body() body: ClassHasDocumentBodyDto,
    @Res() response,
  ) {
    const { startDate } = body;

    // find meeting schedule
    const document = await this.documentService.findById(documentId);
    if (document.statusCode !== 200)
      return response.status(document.statusCode).send(document);

    const res = await this.classHasDocumentService.createOrUpdate({
      ...body,
      classId,
      documentId,
    });

    // send notification
    if (res.statusCode === 200) {
      const userInClass = await this.userJoinClassService.list({
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        deletedAt: null,
      });
      if (
        userInClass.statusCode === 200 &&
        userInClass.data &&
        userInClass.data.length
      ) {
        const now = new Date(new Date().getTime() + 10000);
        const sendDate =
          new Date(startDate).getTime() < now.getTime()
            ? now
            : new Date(startDate);
        console.log(sendDate);

        const emails = userInClass.data.map((data) => data.userId.email);
        sendNotification({
          recipients: emails,
          subject: `กำหนดส่ง ${document.data.name}`,
          text: `ดูรายละเอียดได้ที่\n${FRONT_END_URL}/document/${documentId}`,
          sendDate,
        });
      }
    }

    response.status(res.statusCode).send(res);
  }

  @Put(`${defaultPath}/:documentId`)
  async updateDocument(
    @Param('documentId') documentId: string,
    @Body() body: DocumentUpdateDto,
    @Res() response,
  ) {
    const res = await this.documentService.update(
      toMongoObjectId({ value: documentId, key: 'documentId' }),
      body,
    );
    response.status(res.statusCode).send(res);
  }

  @Patch(`class/:classId/${defaultPath}/:documentId/date/status`)
  async changeDocumentInClass(
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

  @Delete(`project/:projectId/${defaultPath}/:documentId`)
  async deleteSendDocument(
    @Param('documentId') documentId: string,
    @Param('projectId') projectId: string,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    // เช็ค project กับ userId ว่ามีสามารถเข้าถึงได้มั๊ยกรณีเป็น student
    const findUser = await this.projectHasUserService.findOne({
      projectId: toMongoObjectId({
        value: projectId,
        key: 'projectId',
      }),
      userId,
      isAccept: true,
      deletedAt: null,
      role: { $in: [0, 1] }, //owner or partner
    });
    if (findUser.statusCode === 404)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });
    else if (findUser.statusCode !== 200)
      return response.status(findUser.statusCode).send(findUser);

    const res = await this.projectSendDocumentService.delete({
      projectId,
      documentId,
    });
    response.status(res.statusCode).send(res);
  }
}
