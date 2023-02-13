import {
  Body,
  Controller,
  HttpCode,
  Post,
  Get,
  Param,
  Query,
  Res,
} from '@nestjs/common';
import { ProjectCreateDto } from 'src/dto/project.dto';
import { ProjectService } from 'src/services/project.service';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

const defaultPath = 'project';

@Controller()
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post(defaultPath)
  @HttpCode(201)
  async createProject(@Body() projectCreateDto: ProjectCreateDto) {
    return await this.projectService.create(projectCreateDto);
  }

  @Get(`class/:id/${defaultPath}`)
  async listProjectInClass(
    @Param('id') classId: string,
    @Query('sort') sort: string,
    @Res() response,
  ) {
    const res = await this.projectService.list(sort, {
      classId: toMongoObjectId({ value: classId, key: 'classId' }),
    });
    response.status(res.statusCode).send(res);
  }
}
