import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChangeImageUserDto } from 'src/dto/user.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { User } from 'src/schema/user.schema';
import { UserHasRole } from 'src/schema/userHasRole.schema';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('user')
    private userModel: Model<User>,
    @InjectModel('user_has_role')
    private userHasRoleModel: Model<UserHasRole>,
  ) {}

  async createOrUpdate(body: {
    email: string;
    displayName?: string;
    lastLoginAt?: Date | null;
  }): Promise<ResponsePattern> {
    try {
      const { email } = body;
      const findAndUpdateUser = await this.userModel.findOneAndUpdate(
        { email, deletedAt: null },
        body,
        { upsert: true, new: true },
      );

      // if new user, create role.
      const { _id, displayName } = findAndUpdateUser;
      const findRole = await this.userHasRoleModel
        .find({
          userId: _id,
          deletedAt: null,
        })
        .select({ role: 1, _id: 0, currentRole: 1, userId: 1 });
      let roles: Array<any> | null =
        findRole && findRole.length
          ? findRole.map((a) => ({
              userId: a.userId,
              role: a.role,
              currentRole: a.currentRole,
            }))
          : null;

      if (!roles) {
        const createRole = new this.userHasRoleModel({
          userId: _id,
          role: 0,
          currentRole: true,
        });
        await createRole.save();
        roles = [{ userId: _id, role: 0, currentRole: true }];
      }
      // ===========================

      return {
        statusCode: 200,
        message: 'Update user successful',
        data: { userId: _id, role: roles, displayName },
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'Update user error',
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

      const data = await this.userModel
        .find(filter, null, {
          sort: sortSelect,
        })
        .populate('classId');
      return { statusCode: 200, message: 'List Project Successful', data };
    } catch (error) {
      console.log(error);
      return { statusCode: 400, message: 'List Project Error', error };
    }
  }

  async findOne(filter: any): Promise<ResponsePattern> {
    try {
      const data = await this.userModel.findOne(filter);
      if (!data) {
        return {
          statusCode: 404,
          message: 'User Not Found',
        };
      }
      return {
        statusCode: 200,
        message: 'Find User Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return {
        statusCode: 400,
        message: 'Find User Error',
        error,
      };
    }
  }
}
