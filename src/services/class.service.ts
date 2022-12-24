import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClassCreateDto, ClassUpdateDto } from 'src/dto/class.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';

@Injectable()
export class ClassService {
  constructor(
    @InjectModel('class')
    private classModel: Model<ClassCreateDto>,
  ) {}

  async createClass(body: ClassCreateDto): Promise<ResponsePattern> {
    try {
      const createClass = new this.classModel(body);
      await createClass.save();
      return { statusCode: 201, message: 'Create Class Successful' };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Create Class Error', error };
    }
  }

  async listClass(): Promise<ResponsePattern> {
    try {
      const data = [];
      return { statusCode: 200, message: 'List Class Successful', data };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'List Class Error', error };
    }
  }

  async updateClass(
    _id: string,
    body: ClassUpdateDto,
  ): Promise<ResponsePattern> {
    try {
      await this.classModel.updateOne({ _id }, body, {
        runValidators: true,
      });
      return { statusCode: 200, message: 'Update Class Successful' };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Update Class Error', error };
    }
  }

  async deleteClass(_id: string): Promise<ResponsePattern> {
    try {
      await this.classModel.updateOne(
        { _id },
        { deletedAt: new Date() },
        { runValidators: true },
      );
      return { statusCode: 200, message: 'Delete Class Successful' };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Delete Class Error', error };
    }
  }
}
