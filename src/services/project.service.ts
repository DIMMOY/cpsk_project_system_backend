import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectCreateDto } from 'src/dto/project.dto';
import { Project } from 'src/schema/project.schema';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';
import { UserHasProject } from 'src/schema/userHasProject.schema';

@Injectable()
export class ProjectCreateService {
  constructor(
    @InjectModel('project')
    private projectModel: Model<Project>,
    @InjectModel('user_has_project')
    private userHasProjectModel: Model<UserHasProject>,
  ) {}

  async createProject(
    projectCreateDto: ProjectCreateDto,
  ): Promise<ResponsePattern> {
    try {
      const {
        userId, //ชั่วคราว
        classId,
        nameTH,
        nameEN,
        description,
        partners,
        advisors,
      } = projectCreateDto;
      const createProject = new this.projectModel(
        {
          classId,
          nameTH,
          nameEN,
          description,
        },
        null,
        { new: true },
      );
      const projectId = (await createProject.save())._id;
      console.log(projectId);
      const ownerRole = [{ projectId, userId, role: 0 }];
      const partnersRole = partners.map((userId) => ({
        projectId,
        userId,
        role: 1,
      }));
      const advisorsRole = advisors.map((userId) => ({
        projectId,
        userId,
        role: 2,
      }));
      await this.userHasProjectModel.insertMany([
        ...ownerRole,
        ...partnersRole,
        ...advisorsRole,
      ]);
      return { statusCode: 201, message: 'Create Project Successful' };
    } catch (error) {
      console.log(error);
      return { statusCode: 400, message: 'Create Project Error', error };
    }
  }
}
