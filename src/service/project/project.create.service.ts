import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProjectCreateDto } from 'src/dto/project.dto';

@Injectable()
export class ProjectCreateService {
  constructor(
    @InjectModel('project')
    private projectCreateModel: Model<ProjectCreateDto>,
  ) {}

  async projectCreate(projectCreateDto: ProjectCreateDto) {
    try {
      const createProject = new this.projectCreateModel(projectCreateDto);
      // await createProject.save();
      return await createProject.save();
    } catch (e) {
      console.log(e);
      return { statusCode: 400, message: 'Project create error', error: e };
    }
  }
}
