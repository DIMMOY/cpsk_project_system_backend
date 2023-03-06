import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { JoinClassDto } from 'src/dto/userJoinClass.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { UserJoinClass } from 'src/schema/userJoinClass.schema';

@Injectable()
export class UserJoinClassService {
  constructor(
    @InjectModel('user_join_class')
    private userJoinClassModel: Model<UserJoinClass>,
  ) {}

  async create(body: {
    userId: Types.ObjectId;
    classId: Types.ObjectId;
  }): Promise<ResponsePattern> {
    try {
      const createUserJoinClass = new this.userJoinClassModel(body);
      await createUserJoinClass.save();
      return {
        statusCode: 201,
        message: 'Create User In Class Successful',
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'Create User In Class error',
        error,
      };
    }
  }

  async findOne(filter: any): Promise<ResponsePattern> {
    try {
      const data = await this.userJoinClassModel
        .findOne(filter)
        .populate('classId')
        .populate('userId');
      if (!data) {
        return {
          statusCode: 404,
          message: 'User In Class Not Found',
        };
      }
      return {
        statusCode: 200,
        message: 'Find User In Class Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'Find User In Class Error',
        error,
      };
    }
  }

  async list(filter: any): Promise<ResponsePattern> {
    try {
      const data = await this.userJoinClassModel
        .find(filter)
        .populate('classId')
        .populate('userId');
      if (!data) {
        return {
          statusCode: 404,
          message: 'User In Class Not Found',
        };
      }
      return {
        statusCode: 200,
        message: 'Find User In Class Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'Find User In Class Error',
        error,
      };
    }
  }

  async findAndCheckHasProject(
    filter: any,
    hasProject: string,
  ): Promise<ResponsePattern> {
    try {
      let data = await this.userJoinClassModel.aggregate([
        {
          $lookup: {
            from: 'project_has_users',
            localField: 'userId',
            foreignField: 'userId',
            as: 'project',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $match: filter,
        },
        {
          $addFields: {
            project: {
              $filter: {
                input: '$project',
                as: 'proj',
                cond: {
                  $and: [
                    { $in: ['$$proj.role', [0, 1]] },
                    { $eq: ['$$proj.deletedAt', null] },
                    { $eq: ['$$proj.classId', filter.classId] },
                  ],
                },
              },
            },
          },
        },
      ]);
      if (hasProject === 'true') data = data.filter((e) => e.project.length);
      else data = data.filter((e) => !e.project.length);
      return {
        statusCode: 200,
        message: 'List User In Class Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'List User In Class Error',
        error,
      };
    }
  }
}
