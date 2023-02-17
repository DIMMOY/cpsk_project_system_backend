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
  Req,
  Res,
} from '@nestjs/common';
import { response } from 'express';
import { ClassCreateDto, ClassUpdateDto } from 'src/dto/class.dto';
import { ClassService } from 'src/services/class.service';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

const defaultPath = 'class';

@Controller()
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  @Get(defaultPath)
  async listClass(
    @Query('sort') sort: string,
    @Query('select') select: string,
    @Query('major') major: string,
    @Res() response,
  ) {
    const res = await this.classService.list(sort, select, major);
    response.status(res.statusCode).send(res);
  }

  @Get(`${defaultPath}/:classId`)
  async getClass(@Param('classId') classId: string, @Res() response) {
    const res = await this.classService.findOne({
      _id: toMongoObjectId({ value: classId, key: 'classId' }),
    });
    response.status(res.statusCode).send(res);
  }

  @Post(defaultPath)
  async createClass(@Body() body: ClassCreateDto, @Res() response) {
    const res = await this.classService.create(body);
    response.status(res.statusCode).send(res);
  }

  @Put(`${defaultPath}/:classId`)
  async updateClass(
    @Param('classId') classId: string,
    @Body() body: ClassUpdateDto,
    @Res() response,
  ) {
    const res = await this.classService.update(classId, body);
    response.status(res.statusCode).send(res);
  }

  @Delete(`${defaultPath}/:classId`)
  @HttpCode(200)
  async deleteClass(@Param('classId') classId: string, @Res() response) {
    const res = await this.classService.delete(classId);
    response.status(res.statusCode).send(res);
  }
}
