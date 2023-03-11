import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ClassHasAssessmentCreateDto } from 'src/dto/classHasAssessment.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { ProjectHasAssessment } from 'src/schema/projectHasAssessment.schema';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

@Injectable()
export class ProjectHasAssessmentService {
  constructor(
    @InjectModel('project_has_assessment')
    private projectHasAssessmentModel: Model<ProjectHasAssessment>,
  ) {}

  async createOrUpdate(body: {
    projectId: Types.ObjectId;
    classHasAssessmentId: Types.ObjectId;
    userId: Types.ObjectId;
    form: Array<number>;
    limitScore: number;
    rawScore: number;
    sumScore: number;
    assessBy: number;
    matchCommitteeId: string | Types.ObjectId | null;
    feedBack: string | null;
  }): Promise<ResponsePattern> {
    try {
      const {
        projectId,
        classHasAssessmentId,
        userId,
        assessBy,
        matchCommitteeId,
      } = body;
      await this.projectHasAssessmentModel.updateOne(
        {
          projectId,
          classHasAssessmentId,
          userId,
          matchCommitteeId,
          assessBy,
          deletedAt: null,
        },
        body,
        { upsert: true },
      );
      return {
        statusCode: 200,
        message: 'Create Or Update ProjectHasAssessment Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Create Or Update ProjectHasAssessment Error',
        error,
      };
    }
  }

  async findOne(filter: any): Promise<ResponsePattern> {
    try {
      const data = await this.projectHasAssessmentModel
        .findOne(filter)
        .populate('classHasAssessmentId');
      if (!data) {
        return {
          statusCode: 404,
          message: 'ProjectHasAssessment Not Found',
        };
      }
      return {
        statusCode: 200,
        message: 'Find ProjectHasAssessment Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'Find ProjectHasAssessment Error',
        error,
      };
    }
  }

  async list(
    sort: string | null,
    filter: any,
    select?: any,
  ): Promise<ResponsePattern> {
    try {
      const typeSort = {
        createdAtASC: { createdAt: 1 },
        createdAtDESC: { createdAt: -1 },
        name: { name: 1 },
      };

      const sortSelect =
        sort && typeSort[sort] ? typeSort[sort] : { createdAt: -1 };

      const data = await this.projectHasAssessmentModel
        .find(filter, null, {
          sort: sortSelect,
        })
        .select(select ? select : {})
        .populate('classHasAssessmentId')
        .populate('userId')
        .populate('matchCommitteeId');
      return {
        statusCode: 200,
        message: 'List ProjectHasAssessment Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'List ProjectHasAssessment Error',
        error,
      };
    }
  }

  async delete(filter: any): Promise<ResponsePattern> {
    try {
      await this.projectHasAssessmentModel.updateMany(
        filter,
        { deletedAt: new Date() },
        { timestamps: false },
      );
      return {
        statusCode: 200,
        message: 'Delete ProjectHasAssessment Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Delete ProjectHasAssessment Error',
        error,
      };
    }
  }
}
