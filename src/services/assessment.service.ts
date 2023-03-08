import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  AssessmentCreateDto,
  AssessmentUpdateDto,
} from 'src/dto/assessment.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { Assessment } from 'src/schema/assessment.schema';

@Injectable()
export class AssessmentService {
  constructor(
    @InjectModel('assessment')
    private assesssmentModel: Model<Assessment>,
  ) {}

  async create(body: AssessmentCreateDto): Promise<ResponsePattern> {
    try {
      const createAssessment = new this.assesssmentModel(body);
      await createAssessment.save();
      return { statusCode: 201, message: 'Create Assessment Successful' };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Create Assessment Error', error };
    }
  }

  async findOne(filter: any): Promise<ResponsePattern> {
    try {
      const data = await this.assesssmentModel.findOne(filter);
      if (!data) {
        return {
          statusCode: 404,
          message: 'Assessment Not Found',
        };
      }
      return {
        statusCode: 200,
        message: 'Find Assessment Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'Find Assessment Error',
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

      const data = await this.assesssmentModel.find(filter, null, {
        sort: sortSelect,
      });

      return { statusCode: 200, message: 'List Assessment Successful', data };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'List Assessment Error', error };
    }
  }

  async update(
    _id: Types.ObjectId,
    body: AssessmentUpdateDto,
  ): Promise<ResponsePattern> {
    try {
      await this.assesssmentModel.updateOne({ _id }, body, {
        runValidators: true,
      });
      return { statusCode: 200, message: 'Update Assessment Successful' };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Update Assessment Error', error };
    }
  }

  async delete(_id: string): Promise<ResponsePattern> {
    try {
      await this.assesssmentModel.updateOne(
        { _id },
        { deletedAt: new Date() },
        { runValidators: true },
      );
      return { statusCode: 200, message: 'Delete Assessment Successful' };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Delete Assessment Error', error };
    }
  }
}
