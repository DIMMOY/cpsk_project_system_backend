import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentUpdateDto } from 'src/dto/document.dto';
import { ProjectSendMeetingScheduleCreateDto } from 'src/dto/projectSendMeetingSchedule.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { ProjectSendMeetingSchedule } from 'src/schema/projectSendMeetingSchedule.schema';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

@Injectable()
export class ProjectSendMeetingScheduleService {
  constructor(
    @InjectModel('project_send_meeting_schedule')
    private projectSendMeetingScheduleModel: Model<ProjectSendMeetingSchedule>,
  ) {}

  async createOrUpdateProjectSendMeetingSchedule(
    body: ProjectSendMeetingScheduleCreateDto,
  ): Promise<ResponsePattern> {
    try {
      const { projectId: userId, documentId } = body;
      await this.projectSendMeetingScheduleModel.findOneAndUpdate(
        {
          projectId: userId,
          documentId,
          deletedAt: null,
        },
        body,
        { upsert: true },
      );
      return {
        statusCode: 201,
        message: 'Create ProjectSendMeetingSchedule Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Create ProjectSendMeetingSchedule Error',
        error,
      };
    }
  }

  async listProjectSendMeetingSchedule(
    sort: string | null,
    filter: any,
  ): Promise<ResponsePattern> {
    try {
      const typeSort = {
        createdAtASC: { createdAt: 1 },
        createdAtDESC: { createdAt: -1 },
        name: { name: 1 },
      };
      const sortSelect =
        sort && typeSort[sort] ? typeSort[sort] : { createdAt: -1 };

      const data = await this.projectSendMeetingScheduleModel
        .find(filter, null, {
          sort: sortSelect,
        })
        .populate('meetingScheduleId');
      return {
        statusCode: 200,
        message: 'List ProjectSendMeetingSchedule Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'List ProjectSendMeetingSchedule Error',
        error,
      };
    }
  }

  async updateProjectSendMeetingSchedule(
    _id: string,
    body: DocumentUpdateDto,
  ): Promise<ResponsePattern> {
    try {
      await this.projectSendMeetingScheduleModel.updateOne({ _id }, body, {
        runValidators: true,
      });
      return {
        statusCode: 200,
        message: 'Update ProjectSendMeetingSchedule Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Update ProjectSendMeetingSchedule Error',
        error,
      };
    }
  }

  async deleteProjectSendMeetingSchedule(
    _id: string,
  ): Promise<ResponsePattern> {
    try {
      await this.projectSendMeetingScheduleModel.updateOne(
        { _id },
        { deletedAt: new Date() },
        { runValidators: true },
      );
      return {
        statusCode: 200,
        message: 'Delete ProjectSendMeetingSchedule Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Delete ProjectSendMeetingSchedule Error',
        error,
      };
    }
  }
}
