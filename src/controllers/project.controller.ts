import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ProjectCreateDto } from 'src/dto/project.dto';
import { ProjectCreateService } from 'src/services/project/project.create.service';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectCreateService: ProjectCreateService) {}

  @Post()
  @HttpCode(201)
  async createProject(@Body() projectCreateDto: ProjectCreateDto) {
    return await this.projectCreateService.projectCreate(projectCreateDto);
  }
}
