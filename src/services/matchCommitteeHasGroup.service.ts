import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { MatchCommitteeHasGroup } from 'src/schema/matchCommitteeHasGroup.schema';

@Injectable()
export class MatchCommitteeHasGroupService {
  constructor(
    @InjectModel('match_committee_has_group')
    private matchCommitteeHasGroupModel: Model<MatchCommitteeHasGroup>,
  ) {}

  async createOrUpdate(body: {
    matchCommitteeId: Types.ObjectId;
    userId: Array<Types.ObjectId>;
  }): Promise<ResponsePattern> {
    try {
      const create = new this.matchCommitteeHasGroupModel(body);
      await create.save();
      return {
        statusCode: 201,
        message: 'Create Match Committee Has Group Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Create Match Committee Has Group Error',
        error,
      };
    }
  }

  async list(sort: string | null, filter: any): Promise<ResponsePattern> {
    try {
      const typeSort = {
        createdAtASC: { createdAt: 1 },
        createdAtDESC: { createdAt: -1 },
      };

      const sortSelect =
        sort && typeSort[sort] ? typeSort[sort] : { createdAt: -1 };

      const data = await this.matchCommitteeHasGroupModel
        .find(filter, null, {
          sort: sortSelect,
        })
        .populate('matchCommitteeId')
        .populate('userId');
      return {
        statusCode: 200,
        message: 'List Match Committee Has Group Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'List Match Committee Has Group Error',
        error,
      };
    }
  }

  async findOne(filter: any): Promise<ResponsePattern> {
    try {
      const data = await this.matchCommitteeHasGroupModel.findOne(filter);
      if (!data) {
        return {
          statusCode: 404,
          message: 'Match Committee Has Group Not Found',
        };
      }
      return {
        statusCode: 200,
        message: 'Find Match Committee Has Group Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'Find Match Committee Has Group Error',
        error,
      };
    }
  }

  async deleteMany(filter: any): Promise<ResponsePattern> {
    try {
      await this.matchCommitteeHasGroupModel.updateMany(
        filter,
        { deletedAt: new Date() },
        { timestamps: false },
      );
      return {
        statusCode: 200,
        message: 'Delete Match Committee Has Group Successful',
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 400,
        message: 'Delete Match Committee Has Group Error',
        error,
      };
    }
  }
}
