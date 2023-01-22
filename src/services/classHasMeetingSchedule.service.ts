import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClassHasMeetingScheduleCreateDto } from 'src/dto/classHasMeetingSchedule.dto';
import { DocumentUpdateDto } from 'src/dto/document.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { ClassHasMeetingSchedule } from 'src/schema/classHasMeetingSchedule.schema';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

@Injectable()
export class ClassHasMeetingScheduleService {
  constructor(
    @InjectModel('class_has_meeting_schedule')
    private classHasMeetingScheduleModel: Model<ClassHasMeetingSchedule>,
  ) {}

  async createOrUpdate(
    body: ClassHasMeetingScheduleCreateDto,
  ): Promise<ResponsePattern> {
    try {
      const { classId, meetingScheduleId, startDate, endDate } = body;
      await this.classHasMeetingScheduleModel.updateOne(
        {
          classId: toMongoObjectId({ value: classId, key: 'classId' }),
          meetingScheduleId: toMongoObjectId({
            value: meetingScheduleId,
            key: 'meetingScheduleId',
          }),
          deletedAt: null,
        },
        {
          classId: toMongoObjectId({ value: classId, key: 'classId' }),
          meetingScheduleId: toMongoObjectId({
            value: meetingScheduleId,
            key: 'meetingScheduleId',
          }),
          startDate,
          endDate,
        },
        { upsert: true },
      );
      return {
        statusCode: 200,
        message: 'Create Or Update ClassHasMeetingSchedule Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Create Or Update ClassHasMeetingSchedule Error',
        error,
      };
    }
  }

  async findOne(filter: any): Promise<ResponsePattern> {
    try {
      const data = await this.classHasMeetingScheduleModel
        .findOne(filter)
        .populate('meetingScheduleId');
      if (!data) {
        return {
          statusCode: 404,
          message: 'ClassHasMeetingSchedule Not Found',
        };
      }
      return {
        statusCode: 200,
        message: 'Find ClassHasMeetingSchedule Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'Find ClassHasMeetingSchedule Error',
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

      const data = await this.classHasMeetingScheduleModel
        .find(filter, null, {
          sort: sortSelect,
        })
        .populate('meetingScheduleId');
      return {
        statusCode: 200,
        message: 'List ClassHasMeetingSchedule Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'List ClassHasMeetingSchedule Error',
        error,
      };
    }
  }

  async update(_id: string, body: DocumentUpdateDto): Promise<ResponsePattern> {
    try {
      await this.classHasMeetingScheduleModel.updateOne({ _id }, body, {
        runValidators: true,
      });
      return {
        statusCode: 200,
        message: 'Update ClassHasMeetingSchedule Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Update ClassHasMeetingSchedule Error',
        error,
      };
    }
  }

  async delete(_id: string): Promise<ResponsePattern> {
    try {
      await this.classHasMeetingScheduleModel.updateOne(
        { _id },
        { deletedAt: new Date() },
        { runValidators: true },
      );
      return {
        statusCode: 200,
        message: 'Delete ClassHasMeetingSchedule Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Delete ClassHasMeetingSchedule Error',
        error,
      };
    }
  }
}
