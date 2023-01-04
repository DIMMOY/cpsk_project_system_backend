import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrUpdateUserDto } from 'src/dto/user.dto';
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

  async createOrUpdateUser(
    createOrUpdateUserDto: CreateOrUpdateUserDto,
  ): Promise<ResponsePattern> {
    try {
      const { email } = createOrUpdateUserDto;
      const findAndUpdateUser = await this.userModel.findOneAndUpdate(
        { email, deletedAt: null },
        createOrUpdateUserDto,
        { upsert: true, new: true },
      );

      // if new user, create role.
      const { _id } = findAndUpdateUser;
      const findRole = await this.userHasRoleModel
        .find({
          userId: _id,
          deletedAt: null,
        })
        .select({ role: 1, _id: 0, currentRole: 1, userId: 1 });
      // console.log(findRole)
      let roles: Array<any> | null =
        findRole && findRole.length
          ? findRole.map((a) => ({
              userId: a.userId, // สำหรับทดสอบเท่านั้น
              role: a.role,
              currentRole: a.currentRole,
            }))
          : null;

      if (!roles) {
        const createRole = new this.userHasRoleModel({
          userId: _id, // สำหรับทดสอบเท่านั้น
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
        data: roles,
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
}
