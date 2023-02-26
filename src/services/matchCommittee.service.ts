import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { MatchCommittee } from 'src/schema/matchCommittee.schema';

@Injectable()
export class MatchCommitteeService {
  constructor(
    @InjectModel('match_committee')
    private matchCommitteeModel: Model<MatchCommittee>,
  ) {}

  async create(body: {
    classId: Types.ObjectId;
    name: string;
  }): Promise<ResponsePattern> {
    try {
      const createMatchCommittee = new this.matchCommitteeModel(body);
      await createMatchCommittee.save();
      return { statusCode: 201, message: 'Create Match Committee Successful' };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Create Match Committee Error',
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

      const data = await this.matchCommitteeModel
        .find(filter, null, {
          sort: sortSelect,
        })
        .populate('classId');
      return {
        statusCode: 200,
        message: 'List Match Committee Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return { statusCode: 400, message: 'List Match Committee Error', error };
    }
  }

  async findOne(filter: any): Promise<ResponsePattern> {
    try {
      const data = await this.matchCommitteeModel.findOne(filter);
      if (!data) {
        return {
          statusCode: 404,
          message: 'Match Committee Not Found',
        };
      }
      return {
        statusCode: 200,
        message: 'Find Match Committee Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'Find Match Committee Error',
        error,
      };
    }
  }
}
