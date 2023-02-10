import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { AssessmentCreateDto } from 'src/dto/assessment.dto';
import { ClassCreateDto, ClassUpdateDto } from 'src/dto/class.dto';
import { AssessmentService } from 'src/services/assessment.service';
import { ClassService } from 'src/services/class.service';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

const defaultPath = 'assessment';

@Controller()
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Get(defaultPath)
  @HttpCode(200)
  async listClass(@Query('sort') sort: string) {
    return await this.assessmentService.list(sort);
  }

  @Post(defaultPath)
  @HttpCode(201)
  async createClass(@Body() body: AssessmentCreateDto) {
    return await this.assessmentService.create(body);
  }

  @Put(`${defaultPath}/:id`)
  @HttpCode(200)
  async updateClass(@Param('id') id: string, @Body() body: ClassUpdateDto) {
    return await this.assessmentService.update(
      toMongoObjectId({ value: id, key: 'id' }),
      body,
    );
  }

  //   @Delete(`${defaultPath}/:id`)
  //   @HttpCode(200)
  //   async deleteClass(@Param('id') id: string) {
  //     return await this.classService.delete(id);
  //   }
}
