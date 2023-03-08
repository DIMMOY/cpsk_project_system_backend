import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ClassHasAssessmentCreateDto,
  ClassHasAssessmentStatusDto,
} from 'src/dto/classHasAssessment.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { ClassHasAssessment } from 'src/schema/classHasAssessment.schema';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

@Injectable()
export class ClassHasAssessmentService {
  constructor(
    @InjectModel('class_has_assessment')
    private classHasAssessmentModel: Model<ClassHasAssessment>,
  ) {}

  async createOrUpdate(body: {
    classId: Types.ObjectId;
    assessmentId: Types.ObjectId;
    startDate: Date;
    endDate: Date;
    matchCommitteeId: Array<Types.ObjectId>;
    assessment?: any;
  }): Promise<ResponsePattern> {
    try {
      const { classId, assessmentId } = body;

      await this.classHasAssessmentModel.updateOne(
        {
          classId,
          assessmentId,
          deletedAt: null,
        },
        {
          ...body,
          status: true,
        },
        { upsert: true },
      );
      return {
        statusCode: 200,
        message: 'Create Or Update ClassHasAssessment Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Create Or Update ClassHasAssessment Error',
        error,
      };
    }
  }

  async findOne(filter: any): Promise<ResponsePattern> {
    try {
      const data = await this.classHasAssessmentModel
        .findOne(filter)
        .populate('matchCommitteeId');
      if (!data) {
        return {
          statusCode: 404,
          message: 'ClassHasAssessment Not Found',
        };
      }
      return {
        statusCode: 200,
        message: 'Find ClassHasAssessment Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'Find ClassHasAssessment Error',
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

      const data = await this.classHasAssessmentModel
        .find(filter, null, {
          sort: sortSelect,
        })
        .populate('assessmentId');
      return {
        statusCode: 200,
        message: 'List ClassHasAssessment Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'List ClassHasAssessment Error',
        error,
      };
    }
  }

  async updateStatus(
    body: ClassHasAssessmentStatusDto,
  ): Promise<ResponsePattern> {
    try {
      const { classId, assessmentId, status } = body;
      await this.classHasAssessmentModel.updateOne(
        {
          classId: toMongoObjectId({ value: classId, key: 'classId' }),
          assessmentId: toMongoObjectId({
            value: assessmentId,
            key: 'assessmentId',
          }),
          deletedAt: null,
        },
        { status },
      );
      return {
        statusCode: 200,
        message: 'Update Status ClassHasAssessment Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Update Status ClassHasAssessment Error',
        error,
      };
    }
  }

  async delete(_id: string): Promise<ResponsePattern> {
    try {
      await this.classHasAssessmentModel.updateOne(
        { _id },
        { deletedAt: new Date() },
        { runValidators: true },
      );
      return {
        statusCode: 200,
        message: 'Delete ClassHasAssessment Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Delete ClassHasAssessment Error',
        error,
      };
    }
  }
}
