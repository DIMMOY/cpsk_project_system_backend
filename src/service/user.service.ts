import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateOrUpdateUserDto } from 'src/dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel('user')
    private createOrUpdateUserModel: Model<CreateOrUpdateUserDto>,
  ) {}

  async createOrUpdateUser(createOrUpdateUserDto: CreateOrUpdateUserDto) {
    try {
      const { email } = createOrUpdateUserDto;
      const updatedAt = { updatedAt: new Date() };
      await this.createOrUpdateUserModel.findOneAndUpdate(
        { email: email },
        createOrUpdateUserDto,
        { upsert: true },
      );
      return { statusCode: 200, message: 'Update user successful' };
    } catch (e) {
      console.log(e);
      return {
        statusCode: 400,
        message: 'User create or update error',
        error: e,
      };
    }
  }
}
