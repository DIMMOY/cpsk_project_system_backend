import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { DocumentUpdateDto } from 'src/dto/document.dto';
import {
  ProjectSendMeetingScheduleCreateDto,
  ProjectSendMeetingScheduleDeleteDto,
} from 'src/dto/projectSendMeetingSchedule.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { ClassHasMeetingSchedule } from 'src/schema/classHasMeetingSchedule.schema';
import { Project } from 'src/schema/project.schema';
import { ProjectSendMeetingSchedule } from 'src/schema/projectSendMeetingSchedule.schema';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

@Injectable()
export class ProjectSendMeetingScheduleService {
  constructor(
    @InjectModel('project_send_meeting_schedule')
    private projectSendMeetingScheduleModel: Model<ProjectSendMeetingSchedule>,
    @InjectModel('project')
    private projectModel: Model<Project>,
    @InjectModel('class_has_meeting_schedule')
    private classHasMeetingScheduleModel: Model<ClassHasMeetingSchedule>,
  ) {}

  async createOrUpdate(
    body: ProjectSendMeetingScheduleCreateDto,
  ): Promise<ResponsePattern> {
    try {
      const { projectId, meetingScheduleId, detail } = body;
      const mProjectId = toMongoObjectId({
        value: projectId,
        key: 'projectId',
      });
      const mMeetingScheduleId = toMongoObjectId({
        value: meetingScheduleId,
        key: 'meetingScheduleId',
      });

      // ===== check 404 =====
      const project = await this.projectModel
        .findOne({
          _id: mProjectId,
          deletedAt: null,
        })
        .populate('classId');
      if (!project)
        return {
          statusCode: 404,
          message: 'Project Not Found',
        };
      const mClassId = project.classId._id;
      const meetingScheduleInClass =
        await this.classHasMeetingScheduleModel.findOne({
          meetingScheduleId: mMeetingScheduleId,
          classId: mClassId,
          deletedAt: null,
        });
      if (!meetingScheduleInClass)
        return {
          statusCode: 404,
          message: 'Meeting Schedule Not Found',
        };
      // =====================

      await this.projectSendMeetingScheduleModel.updateOne(
        {
          projectId: mProjectId,
          classHasMeetingScheduleId: meetingScheduleInClass._id,
          deletedAt: null,
        },
        {
          projectId: mProjectId,
          classHasMeetingScheduleId: meetingScheduleInClass._id,
          detail,
        },
        { upsert: true },
      );
      return {
        statusCode: 200,
        message: 'Create Or Update ProjectSendMeetingSchedule Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Create Or Update ProjectSendMeetingSchedule Error',
        error,
      };
    }
  }

  async findOne(filter: any): Promise<ResponsePattern> {
    try {
      const data = await this.projectSendMeetingScheduleModel
        .findOne(filter)
        .populate('classHasMeetingScheduleId')
        .populate('projectId');
      return {
        statusCode: 200,
        message: 'Find ProjectSendMeetingSchedule Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'Find ProjectSendMeetingSchedule Error',
        error,
      };
    }
  }

  async list(sort: string | null, filter: any): Promise<ResponsePattern> {
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
        .populate('classHasMeetingScheduleId');
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

  async update(_id: string, body: DocumentUpdateDto): Promise<ResponsePattern> {
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

  async delete(
    body: ProjectSendMeetingScheduleDeleteDto,
  ): Promise<ResponsePattern> {
    try {
      const { projectId, meetingScheduleId } = body;
      const mProjectId = toMongoObjectId({
        value: projectId,
        key: 'projectId',
      });
      const mMeetingScheduleId = toMongoObjectId({
        value: meetingScheduleId,
        key: 'meetingScheduleId',
      });

      // ===== check 404 =====
      const project = await this.projectModel
        .findOne({
          _id: mProjectId,
          deletedAt: null,
        })
        .populate('classId');
      if (!project)
        return {
          statusCode: 404,
          message: 'Project Not Found',
        };
      const mClassId = project.classId._id;
      const meetingScheduleInClass =
        await this.classHasMeetingScheduleModel.findOne({
          meetingScheduleId: mMeetingScheduleId,
          classId: mClassId,
          deletedAt: null,
        });
      if (!meetingScheduleInClass)
        return {
          statusCode: 404,
          message: 'Meeting Schedule Not Found',
        };
      // =====================

      await this.projectSendMeetingScheduleModel.updateOne(
        {
          projectId: mProjectId,
          classHasMeetingScheduleId: meetingScheduleInClass._id,
          deletedAt: null,
        },
        { deletedAt: new Date() },
        {
          timestamps: false,
        },
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
