import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  Query,
  Res,
  Req,
} from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ClassHasMeetingScheduleBodyDto,
  ClassHasMeetingScheduleStatusBodyDto,
} from 'src/dto/classHasMeetingSchedule.dto';
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
  async listMeetingSchedule(@Query('sort') sort: string, @Res() response) {
    const res = await this.meetingScheduleService.list(sort, {});
    response.status(res.statusCode).send(res);
  }

  @Get(`class/:classId/${defaultPath}`)
  async listMeetingScheduleInClass(
    @Param('classId') classId: string,
    @Query('sort') sort: string,
    @Query('status') status: string,
    @Res() response,
  ) {
    // list all meeting schedules
    const meetingSchedules = await this.meetingScheduleService.list(sort, {
      deletedAt: null,
    });
    if (meetingSchedules.statusCode !== 200)
      return response
        .status(meetingSchedules.statusCode)
        .send(meetingSchedules);

    // list meeting schedule in class
    const classHasMeetingSchedules =
      await this.classHasMeetingScheduleService.list(sort, {
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        status: true,
        deletedAt: null,
      });
    if (classHasMeetingSchedules.statusCode !== 200)
      return response
        .status(classHasMeetingSchedules.statusCode)
        .send(classHasMeetingSchedules);

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

    response.status(200).send({
      statusCode: meetingSchedules.statusCode,
      message: meetingSchedules.message,
      data: filterData,
    });
  }

  @Get(`class/:classId/project/:projectId/${defaultPath}/:mtId/detail`)
  async getSendMeetingScheduleDetail(
    @Param('classId') classId: string,
    @Param('mtId') meetingScheduleId: string,
    @Param('projectId') projectId: string,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });
    // เช็ค project กับ userId ว่ามีสามารถเข้าถึงได้มั๊ยกรณีเป็น student กับ advisor
    // ไว้กลับมาทำหลัง สร้าง table project_has_user

    // find class has meeting schedule id
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
    if (mtResponse.statusCode !== 200)
      return response.status(mtResponse.statusCode).send(mtResponse);

    const { startDate, endDate, _id } = mtResponse.data;
    const chmResponse = await this.projectSendMeetingSchedulService.findOne({
      classHasMeetingScheduleId: _id,
      projectId: toMongoObjectId({ value: projectId, key: 'projectId' }),
      deletedAt: null,
    });
    if (chmResponse.statusCode !== 200)
      return response.status(chmResponse.statusCode).send(chmResponse);

    const { data } = chmResponse;
    const sendStatus = data
      ? data.updatedAt.getTime() <=
          data.classHasMeetingScheduleId.endDate.getTime() && data.status
        ? 1
        : data.status
        ? 3
        : 2
      : 0;

    response.status(chmResponse.statusCode).send({
      statusCode: chmResponse.statusCode,
      message: chmResponse.message,
      data: {
        ...data?._doc,
        ...{ sendStatus, startDate, endDate },
        meetingSchedule: mtResponse.data.meetingScheduleId?._doc,
      },
    });
  }

  @Get(`class/:classId/project/:projectId/${defaultPath}`)
  async listSendMeetingScheduleInClass(
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
    // ไว้กลับมาทำหลัง สร้าง table project_has_user

    // find class has meeting schedule
    const classHasMeetingSchedule =
      await this.classHasMeetingScheduleService.list(sort, {
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        startDate: { $lte: new Date() },
        deletedAt: null,
        status: true,
      });
    if (classHasMeetingSchedule.statusCode !== 200)
      return response
        .status(classHasMeetingSchedule.statusCode)
        .send(classHasMeetingSchedule);

    const classHasMeetingScheduleIds = classHasMeetingSchedule.data.map(
      (e) => new Types.ObjectId(e._id),
    );

    // find project send meeting schedule
    const projectSendMeetingSchedule =
      await this.projectSendMeetingSchedulService.list(sort, {
        classHasMeetingScheduleId: { $in: classHasMeetingScheduleIds },
        projectId: toMongoObjectId({ value: projectId, key: 'projectId' }),
        deletedAt: null,
      });
    if (projectSendMeetingSchedule.statusCode !== 200)
      return response
        .status(projectSendMeetingSchedule.statusCode)
        .send(projectSendMeetingSchedule);

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
    response.status(200).send({
      statusCode: classHasMeetingSchedule.statusCode,
      message: classHasMeetingSchedule.message,
      data,
    });
  }

  @Post(defaultPath)
  async createMeetingSchedule(
    @Body() body: MeetingScheduleCreateDto,
    @Res() response,
  ) {
    const res = await this.meetingScheduleService.create(body);
    response.status(res.statusCode).send(res);
  }

  @Post(`project/:projectId/${defaultPath}/:mtId`)
  async createSendMeetingSchedule(
    @Param('projectId') projectId: string,
    @Param('mtId') meetingScheduleId: string,
    @Body() body: ProjectSendMeetingScheduleBodyDto,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });
    // เช็ค project กับ userId ว่ามีสามารถเข้าถึงได้มั๊ยกรณีเป็น student กับ advisor
    // ไว้กลับมาทำหลัง สร้าง table project_has_user

    const res = await this.projectSendMeetingSchedulService.createOrUpdate({
      ...body,
      projectId,
      meetingScheduleId,
    });
    response.status(res.statusCode).send(res);
  }

  @Put(`${defaultPath}/:mtId`)
  async updateMeetingSchedule(
    @Param('mtId') mtId: string,
    @Body() body: MeetingScheduleUpdateDto,
    @Res() response,
  ) {
    const res = await this.meetingScheduleService.update(
      toMongoObjectId({ value: mtId, key: 'meetingScheduleId' }),
      body,
    );
    response.status(res.statusCode).send(res);
  }

  @Put(`class/:classId/${defaultPath}/:mtId/date`)
  async setDateMeetingScheduleInClass(
    @Param('classId') classId: string,
    @Param('mtId') meetingScheduleId: string,
    @Body() body: ClassHasMeetingScheduleBodyDto,
    @Res() response,
  ) {
    const res = await this.classHasMeetingScheduleService.createOrUpdate({
      ...body,
      classId,
      meetingScheduleId,
    });
    response.status(res.statusCode).send(res);
  }

  @Patch(`class/:classId/${defaultPath}/:mtId/date/status`)
  async changeMeetingScheduleInClass(
    @Param('classId') classId: string,
    @Param('mtId') meetingScheduleId: string,
    @Body() body: ClassHasMeetingScheduleStatusBodyDto,
    @Res() response,
  ) {
    const res = await this.classHasMeetingScheduleService.updateStatus({
      ...body,
      classId,
      meetingScheduleId,
    });
    response.status(res.statusCode).send(res);
  }

  @Delete(`${defaultPath}/:id`)
  async deleteMeetingSchedule(@Param('id') id: string, @Res() response) {
    const res = await this.meetingScheduleService.delete(id);
    response.status(res.statusCode).send(res);
  }

  @Delete(`project/:projectId/${defaultPath}/:mtId`)
  async deleteSendMeetingSchedule(
    @Param('mtId') meetingScheduleId: string,
    @Param('projectId') projectId: string,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });
    // เช็ค project กับ userId ว่ามีสามารถเข้าถึงได้มั๊ยกรณีเป็น student กับ advisor
    // ไว้กลับมาทำหลัง สร้าง table project_has_user

    const res = await this.projectSendMeetingSchedulService.delete({
      projectId,
      meetingScheduleId,
    });
    response.status(res.statusCode).send(res);
  }
}
