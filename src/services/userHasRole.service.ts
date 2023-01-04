import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ChangeCurrentRoleDto } from 'src/dto/userHasRole.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { UserHasRole } from 'src/schema/userHasRole.schema';

@Injectable()
export class UserHasRoleService {
  constructor(
    @InjectModel('user_has_role')
    private userHasRoleModel: Model<UserHasRole>,
  ) {}

  async changeCurrentRole(
    reqBody: ChangeCurrentRoleDto,
  ): Promise<ResponsePattern> {
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
