import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClassCreateDto, ClassUpdateDto } from 'src/dto/class.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { Class } from 'src/schema/class.schema';

@Injectable()
export class ClassService {
  constructor(
    @InjectModel('class')
    private classModel: Model<Class>,
  ) {}

  async create(body: ClassCreateDto): Promise<ResponsePattern> {
    try {
      // Convert the random number to a string and add the current timestamp
      let inviteCode: string = (+new Date() * Math.random())
        .toString(36)
        .substring(0, 6);
      let findRepeat = await this.classModel.findOne({ inviteCode });
      while (findRepeat) {
        inviteCode = (+new Date() * Math.random()).toString(36).substring(0, 6);
        findRepeat = await this.classModel.findOne({ inviteCode });
      }
      body.inviteCode = inviteCode;
      const createClass = new this.classModel(body);
      await createClass.save();
      return { statusCode: 201, message: 'Create Class Successful' };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'Create Class Error', error };
    }
  }

  async list(
    sort: string | null,
    select: string | null,
    major: string | null,
  ): Promise<ResponsePattern> {
    try {
      const typeSort = {
        createdAtASC: { createdAt: 1 },
        createdAtDESC: { createdAt: -1 },
        name: { name: 1 },
      };
      const typeSelect = {
        true: { complete: true },
        false: { complete: false },
        all: {},
      };
      const typeMajor = {
        cpe: { major: { $in: ['ALL', 'CPE'] } },
        ske: { major: { $in: ['ALL', 'SKE'] } },
        all: {},
      };
      const filterSelect =
        select && typeSelect[select.toLowerCase()]
          ? typeSelect[select.toLowerCase()]
          : {};
      const filterMajor =
        major && typeMajor[major.toLowerCase()]
          ? typeMajor[major.toLowerCase()]
          : {};
      const sortSelect =
        sort && typeSort[sort] ? typeSort[sort] : { createdAt: -1 };

      const data = await this.classModel.find(
        { ...filterMajor, ...filterSelect },
        null,
        { sort: sortSelect },
      );

      return { statusCode: 200, message: 'List Class Successful', data };
    } catch (error) {
      console.error(error);
      return { statusCode: 400, message: 'List Class Error', error };
    }
  }

  async update(_id: string, body: ClassUpdateDto): Promise<ResponsePattern> {
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

  async delete(_id: string): Promise<ResponsePattern> {
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
