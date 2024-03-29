import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  MeetingScheduleCreateDto,
  MeetingScheduleUpdateDto,
} from 'src/dto/meetingSchedule.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { MeetingSchedule } from 'src/schema/meetingSchedule.schema';

@Injectable()
export class MeetingScheduleService {
  constructor(
    @InjectModel('meeting_schedule')
    private meetingScheduleModel: Model<MeetingSchedule>,
  ) {}

  async create(body: MeetingScheduleCreateDto): Promise<ResponsePattern> {
    try {
      const createDocument = new this.meetingScheduleModel(body);
      await createDocument.save();
      return { statusCode: 201, message: 'Create Meeting Schedule Successful' };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Create Meeting Schedule Error',
        error,
      };
    }
  }

  async findById(id: string): Promise<ResponsePattern> {
    try {
      const data = await this.meetingScheduleModel.findById(id);
      return {
        statusCode: 200,
        message: 'Find Meeting Schedule Successful',
        data,
      };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Find Meeting Schedule Error', error };
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

      const data = await this.meetingScheduleModel.find(filter, null, {
        sort: sortSelect,
      });
      return {
        statusCode: 200,
        message: 'List Meeting Schedule Successful',
        data,
      };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'List Meeting Schedule Error', error };
    }
  }

  async update(
    _id: Types.ObjectId,
    body: MeetingScheduleUpdateDto,
  ): Promise<ResponsePattern> {
    try {
      await this.meetingScheduleModel.updateOne({ _id }, body, {
        runValidators: true,
      });
      return { statusCode: 200, message: 'Update Meeting Schedule Successful' };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Update Meeting Schedule Error',
        error,
      };
    }
  }

  async delete(_id: string): Promise<ResponsePattern> {
    try {
      await this.meetingScheduleModel.updateOne(
        { _id },
        { deletedAt: new Date() },
        { runValidators: true },
      );
      return { statusCode: 200, message: 'Delete Meeting Schedule Successful' };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Delete Meeting Schedule Error',
        error,
      };
    }
  }
}
