import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectCreateDto } from 'src/dto/project.dto';
import { Project } from 'src/schema/project.schema';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { ProjectHasUser } from 'src/schema/projectHasUser.schema';

@Injectable()
export class ProjectHasUserService {
  constructor(
    @InjectModel('project_has_user')
    private projectHasUserModel: Model<ProjectHasUser>,
  ) {}

  async create(projectCreateDto: ProjectCreateDto): Promise<ResponsePattern> {
    try {
      return { statusCode: 201, message: 'Create ProjectHasUser Successful' };
    } catch (error) {
      console.log(error);
      return { statusCode: 400, message: 'Create ProjectHasUser Error', error };
    }
  }

  async list(filter: any, select?: any): Promise<ResponsePattern> {
    try {
      const data = await this.projectHasUserModel
        .find(filter)
        .select(select ? select : {});
      return {
        statusCode: 200,
        message: 'List ProjectHasUser Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return { statusCode: 400, message: 'List ProjectHasUser Error', error };
    }
  }

  async findOne(filter: any): Promise<ResponsePattern> {
    try {
      const data = await this.projectHasUserModel
        .findOne(filter)
        .populate('classId')
        .populate('projectId')
        .populate('userId');
      if (!data) {
        return {
          statusCode: 404,
          message: 'ProjectHasUser Not Found',
        };
      }
      return {
        statusCode: 200,
        message: 'Find ProjectHasUser Successful',
        data,
      };
    } catch (error) {
      console.log(error);
      return { statusCode: 400, message: 'Find ProjectHasUser Error', error };
    }
  }
}
