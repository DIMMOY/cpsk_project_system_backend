import {
  Body,
  Controller,
  HttpCode,
  Post,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ProjectCreateDto } from 'src/dto/project.dto';
import { ClassHasDocumentService } from 'src/services/classHasDocument.service';
import { ClassHasMeetingScheduleService } from 'src/services/classHasMeetingSchedule.service';
import { ProjectService } from 'src/services/project.service';
import { ProjectSendDocumentService } from 'src/services/projectSendDocument.service';
import { ProjectSendMeetingScheduleService } from 'src/services/projectSendMeetingSchedule.service';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

const defaultPath = 'project';

@Controller()
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly classHasDocumentService: ClassHasDocumentService,
    private readonly classHasMeetingScheduleService: ClassHasMeetingScheduleService,
    private readonly projectSendDocumentService: ProjectSendDocumentService,
    private readonly projectSendMeetingSchedulService: ProjectSendMeetingScheduleService,
  ) {}

  @Post(defaultPath)
  @HttpCode(201)
  async createProject(@Body() projectCreateDto: ProjectCreateDto) {
    return await this.projectService.createProject(projectCreateDto);
  }

  @Get(`class/:id/${defaultPath}`)
  @HttpCode(200)
  async listProjectInClass(
    @Param('id') classId: string,
    @Query('sort') sort: string,
  ) {
    return await this.projectService.listProject(sort, {
      classId: toMongoObjectId({ value: classId, key: 'classId' }),
    });
  }

  @Get(`class/:classId/${defaultPath}/:projectId/document`)
  @HttpCode(200)
  async listSendDocumentInClass(
    @Param('classId') classId: string,
    @Param('projectId') projectId: string,
    @Query('sort') sort: string,
  ) {
    const classHasDocuments =
      await this.classHasDocumentService.listClassHasDocument(sort, {
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        deletedAt: null,
      });
    if (classHasDocuments.statusCode !== 200) return classHasDocuments;

    const documentIds = classHasDocuments.data.map(
      (e) => new Types.ObjectId(e.documentId._id),
    );
    const projectSendDocument =
      await this.projectSendDocumentService.listProjectSendDocument(sort, {
        documentId: { $in: documentIds },
        projectId: toMongoObjectId({ value: projectId, key: 'projectId' }),
        deletedAt: null,
      });

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
        sendedAt: findData ? findData.updatedAt : null,
        sendStatus,
      });
    }
    return {
      statusCode: classHasDocuments.statusCode,
      message: classHasDocuments.message,
      data,
    };
  }

  @Get(`class/:classId/${defaultPath}/:projectId/meeting-schedule`)
  @HttpCode(200)
  async listSendMeetingScheduleInClass(
    @Param('classId') classId: string,
    @Param('projectId') projectId: string,
    @Query('sort') sort: string,
  ) {
    const classHasMeetingSchedule =
      await this.classHasMeetingScheduleService.listClassHasMeetingSchedule(
        sort,
        {
          classId: toMongoObjectId({ value: classId, key: 'classId' }),
          deletedAt: null,
        },
      );
    if (classHasMeetingSchedule.statusCode !== 200)
      return classHasMeetingSchedule;

    const meetingScheduleIds = classHasMeetingSchedule.data.map(
      (e) => new Types.ObjectId(e.meetingScheduleId._id),
    );
    const projectSendMeetingSchedule =
      await this.projectSendMeetingSchedulService.listProjectSendMeetingSchedule(
        sort,
        {
          meetingScheduleId: { $in: meetingScheduleIds },
          projectId: toMongoObjectId({ value: projectId, key: 'projectId' }),
          deletedAt: null,
        },
      );

    // filter data
    const data = [];
    for (let i = 0; i < classHasMeetingSchedule.data.length; i++) {
      const {
        _id,
        meetingScheduleId: meetingScheduleIdData,
        endDate,
        startDate,
      } = classHasMeetingSchedule.data[i];
      const { _id: meetingScheduleId, name } = meetingScheduleIdData;
      const findData = projectSendMeetingSchedule.data.find(
        (e) => e.documentId._id?.toString() === meetingScheduleId?.toString(),
      );
      const sendStatus = findData
        ? findData.updatedAt.getTime() <= endDate.getTime()
          ? 1
          : 2
        : 0;
      data.push({
        _id,
        meetingScheduleId,
        name,
        startDate,
        endDate,
        sendedAt: findData ? findData.updatedAt : null,
        sendStatus,
      });
    }
    return {
      statusCode: classHasMeetingSchedule.statusCode,
      message: classHasMeetingSchedule.message,
      data,
    };
  }
}
