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
import { ClassHasMeetingScheduleCreateDto } from 'src/dto/classHasMeetingSchedule.dto';
import {
  MeetingScheduleCreateDto,
  MeetingScheduleUpdateDto,
} from 'src/dto/meetingSchedule.dto';
import { ClassHasMeetingScheduleService } from 'src/services/classHasMeetingSchedule.service';
import { MeetingScheduleService } from 'src/services/meetingSchedule.service';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

const defaultPath = 'meeting-schedule';

@Controller('')
export class MeetingScheduleController {
  constructor(
    private readonly meetingScheduleService: MeetingScheduleService,
    private readonly classHasMeetingScheduleService: ClassHasMeetingScheduleService,
  ) {}

  @Get(defaultPath)
  @HttpCode(200)
  async listMeetingSchedule(@Query('sort') sort: string) {
    return await this.meetingScheduleService.listMeetingSchedule(sort, {});
  }

  @Get(`class/:id/${defaultPath}`)
  async listMeetingScheduleInClass(
    @Param('id') classId: string,
    @Query('sort') sort: string,
    @Query('status') status: string,
  ) {
    const meetingSchedules =
      await this.meetingScheduleService.listMeetingSchedule(sort, {
        deletedAt: null,
      });
    if (meetingSchedules.statusCode !== 200) return meetingSchedules;
    const classHasMeetingSchedules =
      await this.classHasMeetingScheduleService.listClassHasMeetingSchedule(
        sort,
        {
          classId: toMongoObjectId({ value: classId, key: 'classId' }),
          deletedAt: null,
        },
      );
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

  @Post(defaultPath)
  @HttpCode(201)
  async createMeetingSchedule(@Body() body: MeetingScheduleCreateDto) {
    return await this.meetingScheduleService.createMeetingSchedule(body);
  }

  @Post(`class/:id/${defaultPath}`)
  async setDateDocumentInClass(@Body() body: ClassHasMeetingScheduleCreateDto) {
    return await this.classHasMeetingScheduleService.createOrUpdateClassHasMeetingSchedule(
      body,
    );
  }

  @Put(`${defaultPath}/:id`)
  @HttpCode(200)
  async updateDocument(
    @Param('id') id: string,
    @Body() body: MeetingScheduleUpdateDto,
  ) {
    return await this.meetingScheduleService.updateMeetingSchedule(id, body);
  }

  @Delete(`${defaultPath}/:id`)
  @HttpCode(200)
  async deleteDocument(@Param('id') id: string) {
    return await this.meetingScheduleService.deleteMeetingSchedule(id);
  }
}
