import {
  Body,
  Controller,
  HttpCode,
  Post,
  Get,
  Param,
  Query,
} from '@nestjs/common';
import { Types } from 'mongoose';
import { ProjectCreateDto } from 'src/dto/project.dto';
import { ClassHasDocumentService } from 'src/services/classHasDocument.service';
import { ClassHasMeetingScheduleService } from 'src/services/classHasMeetingSchedule.service';
import { ProjectService } from 'src/services/project.service';
import { ProjectSendDocumentService } from 'src/services/projectSendDocument.service';
import { ProjectSendMeetingScheduleService } from 'src/services/projectSendMeetingSchedule.service';
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
  @HttpCode(200)
  async listProjectInClass(
    @Param('id') classId: string,
    @Query('sort') sort: string,
  ) {
    return await this.projectService.list(sort, {
      classId: toMongoObjectId({ value: classId, key: 'classId' }),
    });
  }
}
