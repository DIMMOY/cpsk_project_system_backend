import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChangeCurrentRoleDto } from 'src/dto/userHasRole.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { UserHasRole } from 'src/schema/userHasRole.schema';

@Injectable()
export class UserHasRoleService {
  constructor(
    @InjectModel('user_has_role')
    private userHasRoleModel: Model<UserHasRole>,
  ) {}

  async createOrUpdate(reqBody: {
    userId: Types.ObjectId;
    role: number;
  }): Promise<ResponsePattern> {
    try {
      const { userId, role } = reqBody;
      await this.userHasRoleModel.updateOne(
        {
          userId,
          role,
          deletedAt: null,
        },
        { userId, role },
        { upsert: true, new: true },
      );
      return {
        statusCode: 200,
        message: 'Create UserHasRole successful',
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'Create UserHasRole error',
        error,
      };
    }
  }

  async changeCurrentRole(reqBody: {
    userId: Types.ObjectId;
    role: number;
  }): Promise<ResponsePattern> {
    try {
      const { userId, role } = reqBody;

      const res = await this.userHasRoleModel.findOneAndUpdate(
        { userId, deletedAt: null, role },
        { currentRole: true },
      );

      if (!res) return { statusCode: 404, message: 'Role Not Found' };

      await this.userHasRoleModel
        .updateMany(
          { userId, deletedAt: null, role: { $ne: role } },
          { currentRole: false },
        )
        .populate('userId');

      return { statusCode: 200, message: 'Change Current Role Successful' };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Change Current Role Error', error };
    }
  }

  async list(filter: any): Promise<ResponsePattern> {
    try {
      const data = await this.userHasRoleModel.find(filter).populate('userId');
      if (!data) {
        return {
          statusCode: 404,
          message: 'UserHasRole Not Found',
        };
      }
      return {
        statusCode: 200,
        message: 'Find UserHasRole Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'Find UserHasRole Error',
        error,
      };
    }
  }

  async delete(filter: any): Promise<ResponsePattern> {
    try {
      await this.userHasRoleModel.updateMany(
        filter,
        { deletedAt: new Date() },
        { timestamps: false },
      );
      return { statusCode: 200, message: 'Delete UserHasRole Successful' };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Delete UserHasRole Error', error };
    }
  }
}
