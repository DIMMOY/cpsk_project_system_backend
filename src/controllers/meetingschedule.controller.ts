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
import { Types } from 'mongoose';
import { ClassHasMeetingScheduleBodyDto } from 'src/dto/classHasMeetingSchedule.dto';
import {
  MeetingScheduleCreateDto,
  MeetingScheduleUpdateDto,
} from 'src/dto/meetingSchedule.dto';
import { ProjectSendMeetingScheduleBodyDto } from 'src/dto/projectSendMeetingSchedule.dto';
import { ClassHasMeetingScheduleService } from 'src/services/classHasMeetingSchedule.service';
import { MeetingScheduleService } from 'src/services/meetingSchedule.service';
import { ProjectSendMeetingScheduleService } from 'src/services/projectSendMeetingSchedule.service';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

const defaultPath = 'meeting-schedule';

@Controller('')
export class MeetingScheduleController {
  constructor(
    private readonly meetingScheduleService: MeetingScheduleService,
    private readonly classHasMeetingScheduleService: ClassHasMeetingScheduleService,
    private readonly projectSendMeetingSchedulService: ProjectSendMeetingScheduleService,
  ) {}

  @Get(defaultPath)
  @HttpCode(200)
  async listMeetingSchedule(@Query('sort') sort: string) {
    return await this.meetingScheduleService.list(sort, {});
  }

  @Get(`class/:id/${defaultPath}`)
  @HttpCode(200)
  async listMeetingScheduleInClass(
    @Param('id') classId: string,
    @Query('sort') sort: string,
    @Query('status') status: string,
  ) {
    const meetingSchedules = await this.meetingScheduleService.list(sort, {
      deletedAt: null,
    });
    if (meetingSchedules.statusCode !== 200) return meetingSchedules;
    const classHasMeetingSchedules =
      await this.classHasMeetingScheduleService.list(sort, {
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        deletedAt: null,
      });
    if (classHasMeetingSchedules.statusCode !== 200)
      return classHasMeetingSchedules;

    // filter data
    const data = [];
    for (let i = 0; i < meetingSchedules.data.length; i++) {
      const { _id, name, status, createdAt, updatedAt } =
        meetingSchedules.data[i];
      const findData = classHasMeetingSchedules.data.find(
        (e) => e.meetingScheduleId?._id.toString() === _id?.toString(),
      );
      const statusInClass = findData ? true : false;
      const startDate = findData ? findData.startDate : null;
      const endDate = findData ? findData.endDate : null;
      const openedAt = findData ? findData.updatedAt : null;
      data.push({
        _id,
        name,
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
      statusCode: meetingSchedules.statusCode,
      message: meetingSchedules.message,
      data: filterData,
    };
  }

  @Get(`class/:classId/project/:projectId/${defaultPath}/:mtId/detail`)
  @HttpCode(200)
  async GetSendMeetingScheduleDetail(
    @Param('classId') classId: string,
    @Param('mtId') meetingScheduleId: string,
    @Param('projectId') projectId: string,
  ) {
    const mtResponse = await this.classHasMeetingScheduleService.findOne({
      classId: toMongoObjectId({
        value: classId,
        key: 'classId',
      }),
      meetingScheduleId: toMongoObjectId({
        value: meetingScheduleId,
        key: 'meetingScheduleId',
      }),
      deletedAt: null,
    });
    if (mtResponse.statusCode !== 200) return mtResponse;
    const { startDate, endDate } = mtResponse.data;

    const chmResponse = await this.projectSendMeetingSchedulService.findOne({
      classsHasMeetingScheduleId: {
        meetingScheduleId: toMongoObjectId({
          value: meetingScheduleId,
          key: 'meetingScheduleId',
        }),
      },
      projectId: toMongoObjectId({ value: projectId, key: 'projectId' }),
      deletedAt: null,
    });

    const { data } = chmResponse;
    const sendStatus = data
      ? data.updatedAt.getTime() <=
          data.classHasMeetingScheduleId.endDate.getTime() && data.status
        ? 1
        : data.status
        ? 3
        : 2
      : 0;

    return {
      statusCode: chmResponse.statusCode,
      message: chmResponse.message,
      data: {
        ...data?._doc,
        ...{ sendStatus, startDate, endDate },
        meetingSchedule: mtResponse.data.meetingScheduleId?._doc,
      },
    };
  }

  @Get(`class/:classId/project/:projectId/${defaultPath}`)
  @HttpCode(200)
  async listSendMeetingScheduleInClass(
    @Param('classId') classId: string,
    @Param('projectId') projectId: string,
    @Query('sort') sort: string,
  ) {
    const classHasMeetingSchedule =
      await this.classHasMeetingScheduleService.list(sort, {
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        startDate: { $lte: new Date() },
        deletedAt: null,
      });
    if (classHasMeetingSchedule.statusCode !== 200)
      return classHasMeetingSchedule;

    const classHasMeetingScheduleIds = classHasMeetingSchedule.data.map(
      (e) => new Types.ObjectId(e._id),
    );
    const projectSendMeetingSchedule =
      await this.projectSendMeetingSchedulService.list(sort, {
        classHasMeetingScheduleId: { $in: classHasMeetingScheduleIds },
        projectId: toMongoObjectId({ value: projectId, key: 'projectId' }),
        deletedAt: null,
      });

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
        (e) => e.classHasMeetingScheduleId._id?.toString() === _id?.toString(),
      );

      const sendStatus = findData
        ? findData.updatedAt.getTime() <= endDate.getTime() && findData.status
          ? 1
          : findData.status
          ? 3
          : 2
        : 0;
      data.push({
        _id,
        meetingScheduleId,
        name,
        startDate,
        endDate,
        detail: findData ? findData.detail : null,
        sentAt: findData ? findData.updatedAt : null,
        sendStatus,
      });
    }
    return {
      statusCode: classHasMeetingSchedule.statusCode,
      message: classHasMeetingSchedule.message,
      data,
    };
  }

  @Post(defaultPath)
  @HttpCode(201)
  async createMeetingSchedule(@Body() body: MeetingScheduleCreateDto) {
    return await this.meetingScheduleService.create(body);
  }

  @Post(`project/:projectId/${defaultPath}/:mtId`)
  @HttpCode(200)
  async createSendMeetingSchedule(
    @Param('projectId') projectId: string,
    @Param('mtId') meetingScheduleId: string,
    @Body() body: ProjectSendMeetingScheduleBodyDto,
  ) {
    return await this.projectSendMeetingSchedulService.createOrUpdate({
      ...body,
      projectId,
      meetingScheduleId,
    });
  }

  @Put(`${defaultPath}/:id`)
  @HttpCode(200)
  async updateMeetingSchedule(
    @Param('id') id: string,
    @Body() body: MeetingScheduleUpdateDto,
  ) {
    return await this.meetingScheduleService.update(id, body);
  }

  @Put(`class/:classId/${defaultPath}/:mtId/date`)
  @HttpCode(200)
  async setDateMeetingScheduleInClass(
    @Param('classId') classId: string,
    @Param('mtId') meetingScheduleId: string,
    @Body() body: ClassHasMeetingScheduleBodyDto,
  ) {
    return await this.classHasMeetingScheduleService.createOrUpdate({
      ...body,
      classId,
      meetingScheduleId,
    });
  }

  @Delete(`${defaultPath}/:id`)
  @HttpCode(200)
  async deleteDocument(@Param('id') id: string) {
    return await this.meetingScheduleService.delete(id);
  }

  @Delete(`project/:projectId/${defaultPath}/:mtId`)
  @HttpCode(200)
  async deleteSendMeetingSchedule(
    @Param('mtId') meetingScheduleId: string,
    @Param('projectId') projectId: string,
  ) {
    return await this.projectSendMeetingSchedulService.delete({
      projectId,
      meetingScheduleId,
    });
  }
}
