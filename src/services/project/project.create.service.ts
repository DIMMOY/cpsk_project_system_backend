import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectCreateDto } from 'src/dto/project.dto';
import { ResponsePattern } from 'src/interfaces/responsePattern.interface';

@Injectable()
export class ProjectCreateService {
  constructor(
    @InjectModel('project')
    private projectCreateModel: Model<ProjectCreateDto>,
  ) {}

  async projectCreate(
    projectCreateDto: ProjectCreateDto,
  ): Promise<ResponsePattern> {
    try {
      const createProject = new this.projectCreateModel(projectCreateDto);
      await createProject.save();
      return { statusCode: 201, message: 'Create Project Successful' };
    } catch (error) {
      console.log(error);
      return { statusCode: 400, message: 'Create Project Error', error };
    }
  }
}
