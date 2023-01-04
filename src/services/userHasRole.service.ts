import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateOrUpdateUserDto } from 'src/dto/user.dto';
import { ChangeCurrentRoleDto } from 'src/dto/userHasRole.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { User } from 'src/schema/user.schema';
import { UserHasRole } from 'src/schema/userHasRole.schema';

@Injectable()
export class UserHasRoleService {
  constructor(
    @InjectModel('user_has_role')
    private userHasRoleModel: Model<UserHasRole>,
  ) {}

  async changeCurrentRole(reqBody: ChangeCurrentRoleDto) {
    try {
      const { userId, role } = reqBody;
      await this.userHasRoleModel.updateMany(
        { userId, deletedAt: null },
        { currentRole: false },
      );
      await this.userHasRoleModel.updateMany(
        { userId, deletedAt: null, role },
        { currentRole: true },
      );
      return { statusCode: 200, message: 'Change Current Role Successful' };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Change Current Role Error', error };
    }
  }
}
