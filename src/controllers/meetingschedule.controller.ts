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
import { request } from 'http';
import { Types } from 'mongoose';
import { FRONT_END_URL } from 'src/config';
import {
  ClassHasMeetingScheduleBodyDto,
  ClassHasMeetingScheduleStatusBodyDto,
} from 'src/dto/classHasMeetingSchedule.dto';
import {
  MeetingScheduleCreateDto,
  MeetingScheduleUpdateDto,
} from 'src/dto/meetingSchedule.dto';
import {
  ProjectSendMeetingScheduleBodyDto,
  ProjectSendMeetingScheduleChangeStatusDto,
} from 'src/dto/projectSendMeetingSchedule.dto';
import { ClassHasMeetingScheduleService } from 'src/services/classHasMeetingSchedule.service';
import { MeetingScheduleService } from 'src/services/meetingSchedule.service';
import { ProjectService } from 'src/services/project.service';
import { ProjectHasUserService } from 'src/services/projectHasUser.service';
import { ProjectSendMeetingScheduleService } from 'src/services/projectSendMeetingSchedule.service';
import { UserJoinClassService } from 'src/services/userJoinClass.service';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';
import { sendNotification } from 'src/utils/notification.utils';

const defaultPath = 'meeting-schedule';

@Controller('')
export class MeetingScheduleController {
  constructor(
    private readonly meetingScheduleService: MeetingScheduleService,
    private readonly classHasMeetingScheduleService: ClassHasMeetingScheduleService,
    private readonly projectSendMeetingSchedulService: ProjectSendMeetingScheduleService,
    private readonly projectHasUserService: ProjectHasUserService,
    private readonly projectService: ProjectService,
    private readonly userJoinClassService: UserJoinClassService,
  ) {}

  @Get(defaultPath)
  async listMeetingSchedule(@Query('sort') sort: string, @Res() response) {
    const res = await this.meetingScheduleService.list(sort, {
      deletedAt: null,
    });
    response.status(res.statusCode).send(res);
  }

  @Get(`class/:classId/${defaultPath}`)
  async listMeetingScheduleInClass(
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
        ? 2
        : 3
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

  @Get(`class/:classId/${defaultPath}/overview`)
  async listProjectSendMeetingScheduleInClass(
    @Param('classId') classId: string | Types.ObjectId,
    @Query('id') mtId: string | Types.ObjectId,
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

    let classHasMeetingScheduleId = null;
    let checkMeetingSchedule;
    let meetingSchedule = null;
    if (mtId) {
      mtId = toMongoObjectId({ value: mtId, key: 'meetingScheduleId' });
      checkMeetingSchedule = await this.classHasMeetingScheduleService.findOne({
        classId,
        meetingScheduleId: mtId,
        deletedAt: null,
        status: true,
      });
      if (checkMeetingSchedule.statusCode !== 200)
        return response
          .status(checkMeetingSchedule.statusCode)
          .send(checkMeetingSchedule);
      classHasMeetingScheduleId = checkMeetingSchedule.data._id;
      meetingSchedule = checkMeetingSchedule.data.meetingScheduleId;
    } else {
      checkMeetingSchedule = await this.classHasMeetingScheduleService.list(
        'startDateASC',
        {
          classId,
          deletedAt: null,
          status: true,
        },
      );
      if (checkMeetingSchedule.statusCode !== 200)
        return response
          .status(checkMeetingSchedule.statusCode)
          .send(checkMeetingSchedule);
      classHasMeetingScheduleId = {
        $in: checkMeetingSchedule.data.map((e) => e._id),
      };
    }

    const projectsOb: any = {};

    const projects = await this.projectService.list(sort, {
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
            meetingSchedule: [],
            students: [],
          };
        });
    } else {
      projects.data.forEach((project) => {
        projectsOb[project._id] = {
          ...project._doc,
          meetingSchedule: [],
          students: [],
        };
      });
    }

    const findSendMeetingSchedule =
      await this.projectSendMeetingSchedulService.list('createdAtASC', {
        classHasMeetingScheduleId,
        deletedAt: null,
      });
    if (findSendMeetingSchedule.statusCode !== 200)
      return response
        .status(findSendMeetingSchedule.statusCode)
        .send(findSendMeetingSchedule);

    findSendMeetingSchedule.data.forEach((data) => {
      const sendStatus = data
        ? data.updatedAt.getTime() <=
            data.classHasMeetingScheduleId.endDate.getTime() && data.status
          ? 1
          : data.status
          ? 2
          : 3
        : 0;
      if (projectsOb[data.projectId]) {
        projectsOb[data.projectId].meetingSchedule.push({
          _id: data.classHasMeetingScheduleId.meetingScheduleId,
          sendStatus,
          detail: data.detail,
        });
      }
    });

    const studentInClass = await this.projectHasUserService.list({
      classId,
      role: { $in: [0, 1] },
      deletedAt: null,
    });
    if (studentInClass.statusCode !== 200)
      response.status(studentInClass.statusCode).send(studentInClass);

    studentInClass.data.forEach((data) => {
      if (projectsOb[data.projectId]) {
        projectsOb[data.projectId].students.push(data.userId);
      }
    });

    response.status(findSendMeetingSchedule.statusCode).send({
      statusCode: findSendMeetingSchedule.statusCode,
      message: findSendMeetingSchedule.message,
      data: meetingSchedule
        ? { meetingSchedule, project: Object.values(projectsOb) }
        : { meetingSchedule: 'all', project: Object.values(projectsOb) },
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

    // find class has meeting schedule
    const classHasMeetingSchedules =
      await this.classHasMeetingScheduleService.list(sort, {
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        startDate: { $lte: new Date() },
        deletedAt: null,
        status: true,
      });
    if (classHasMeetingSchedules.statusCode !== 200)
      return response
        .status(classHasMeetingSchedules.statusCode)
        .send(classHasMeetingSchedules);

    const classHasMeetingScheduleIds = classHasMeetingSchedules.data.map(
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
    for (let i = 0; i < classHasMeetingSchedules.data.length; i++) {
      const {
        _id,
        meetingScheduleId: meetingScheduleIdData,
        endDate,
        startDate,
      } = classHasMeetingSchedules.data[i];
      const { _id: meetingScheduleId, name } = meetingScheduleIdData;
      const findData = projectSendMeetingSchedule.data.find(
        (e) => e.classHasMeetingScheduleId._id?.toString() === _id?.toString(),
      );

      const sendStatus = findData
        ? findData.updatedAt.getTime() <= endDate.getTime() && findData.status
          ? 1
          : findData.status
          ? 2
          : 3
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
      statusCode: classHasMeetingSchedules.statusCode,
      message: classHasMeetingSchedules.message,
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
    @Param('mtId') mtId: string,
    @Body() body: ProjectSendMeetingScheduleBodyDto,
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

    const { detail } = body;
    const res = await this.projectSendMeetingSchedulService.createOrUpdate({
      projectId: toMongoObjectId({ value: projectId, key: 'projectId' }),
      meetingScheduleId: toMongoObjectId({
        value: mtId,
        key: 'meetingScheduleId',
      }),
      detail,
      status: false,
    });

    // find Advisor
    const advisor = await this.projectHasUserService.list({
      role: 2,
      projectId: toMongoObjectId({
        value: projectId,
        key: 'projectId',
      }),
      deletedAt: null,
      isAccept: true,
    });

    // find meetingSchedule
    const meetingSchedule = await this.meetingScheduleService.findById(mtId);

    // send notification
    if (
      res.statusCode === 200 &&
      advisor.data &&
      advisor.data.length &&
      meetingSchedule
    ) {
      const emails = advisor.data.map((data) => data.userId.email);
      sendNotification({
        recipients: emails,
        subject: `ส่ง ${meetingSchedule.data.name}`,
        text: `โปรเจกต์ ${findUser.data.projectId.nameTH} ได้ทำการส่ง ${meetingSchedule.data.name} เรียบร้อยแล้ว\nสามารถตรวจสอบได้ที่\n${FRONT_END_URL}/class/${findUser.data.classId._id}/project/${findUser.data.projectId._id}/meeting-schedule/${mtId}`,
      });
    }
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
    @Param('mtId') mtId: string,
    @Body() body: ClassHasMeetingScheduleBodyDto,
    @Res() response,
  ) {
    const { startDate } = body;

    // find meeting schedule
    const meetingSchedule = await this.meetingScheduleService.findById(mtId);
    if (meetingSchedule.statusCode !== 200)
      return response.status(meetingSchedule.statusCode).send(meetingSchedule);

    const res = await this.classHasMeetingScheduleService.createOrUpdate({
      ...body,
      classId,
      meetingScheduleId: mtId,
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
          subject: `กำหนดส่ง ${meetingSchedule.data.name}`,
          text: `ดูรายละเอียดได้ที่\n${FRONT_END_URL}/meeting-schedule/${mtId}`,
          sendDate,
        });
      }
    }
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

  @Patch(`project/:projectId/${defaultPath}/:mtId`)
  async changeStatusInSendMeetingSchedule(
    @Param('projectId') projectId: string,
    @Param('mtId') mtId: string,
    @Body() body: ProjectSendMeetingScheduleChangeStatusDto,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    // find meeting schedule
    const meetingSchedule = await this.meetingScheduleService.findById(mtId);
    if (meetingSchedule.statusCode !== 200)
      return response.status(meetingSchedule.statusCode).send(meetingSchedule);

    // เช็ค project กับ userId ว่ามีสามารถเข้าถึงได้มั๊ยกรณีเป็น advisor
    const findUser = await this.projectHasUserService.findOne({
      projectId: toMongoObjectId({
        value: projectId,
        key: 'projectId',
      }),
      userId,
      isAccept: true,
      deletedAt: null,
      role: 2, //advisor
    });
    if (findUser.statusCode === 404)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });
    else if (findUser.statusCode !== 200)
      return response.status(findUser.statusCode).send(findUser);

    const { status } = body;
    const res = await this.projectSendMeetingSchedulService.createOrUpdate({
      projectId: toMongoObjectId({ value: projectId, key: 'projectId' }),
      meetingScheduleId: toMongoObjectId({
        value: mtId,
        key: 'meetingScheduleId',
      }),
      status,
    });

    if (res.statusCode === 200 && status === true) {
      const projectHasUser = await this.projectHasUserService.list({
        projectId: toMongoObjectId({
          value: projectId,
          key: 'projectId',
        }),
        isAccept: true,
        role: { $in: [0, 1] },
        deletedAt: null,
      });
      if (
        projectHasUser.statusCode === 200 &&
        projectHasUser.data &&
        projectHasUser.data.length
      ) {
        const emails = projectHasUser.data.map((data) => data.userId.email);
        sendNotification({
          recipients: emails,
          subject: `ยืนยันการส่ง ${meetingSchedule.data.name}`,
          text: `อาจารย์ที่ปรึกษาได้ยืนยันการส่ง ${meetingSchedule.data.name} เรียบร้อยแล้ว\nสามารถตรวจสอบได้ที่\n${FRONT_END_URL}/meeting-schedule/${mtId}`,
        });
      }
    }
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

    const res = await this.projectSendMeetingSchedulService.delete({
      projectId,
      meetingScheduleId,
    });
    response.status(res.statusCode).send(res);
  }
}
