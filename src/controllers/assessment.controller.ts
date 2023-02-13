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
  Res,
} from '@nestjs/common';
import {
  AssessmentCreateDto,
  AssessmentUpdateDto,
} from 'src/dto/assessment.dto';
import { AssessmentService } from 'src/services/assessment.service';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

const defaultPath = 'assessment';

@Controller()
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Get(defaultPath)
  async listAssessment(@Query('sort') sort: string, @Res() response) {
    const res = await this.assessmentService.list(sort);
    response.status(res.statusCode).send(res);
  }

  @Post(defaultPath)
  async createAssessment(@Body() body: AssessmentCreateDto, @Res() response) {
    const res = await this.assessmentService.create(body);
    response.status(res.statusCode).send(res);
  }

  @Put(`${defaultPath}/:id`)
  async updateAssessment(
    @Param('id') id: string,
    @Body() body: AssessmentUpdateDto,
    @Res() response,
  ) {
    const res = await this.assessmentService.update(
      toMongoObjectId({ value: id, key: 'id' }),
      body,
    );
    response.status(res.statusCode).send(res);
  }

  //   @Delete(`${defaultPath}/:id`)
  //   @HttpCode(200)
  //   async deleteClass(@Param('id') id: string) {
  //     return await this.classService.delete(id);
  //   }
}
