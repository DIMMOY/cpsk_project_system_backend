import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { response } from 'express';
import { Types } from 'mongoose';
import { ClassCreateDto, ClassUpdateDto } from 'src/dto/class.dto';
import { ClassService } from 'src/services/class.service';
import { UserJoinClassService } from 'src/services/userJoinClass.service';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

const defaultPath = 'class';

@Controller()
export class ClassController {
  constructor(
    private readonly classService: ClassService,
    private readonly userJoinClassService: UserJoinClassService,
  ) {}

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
    @Param('classId') classId: string | Types.ObjectId,
    @Body() body: ClassUpdateDto,
    @Res() response,
  ) {
    classId = toMongoObjectId({ value: classId, key: 'classId' });

    // find class
    const findClass = await this.classService.findOne({
      _id: classId,
      deletedAt: null,
    });
    if (findClass.statusCode !== 200)
      return response.statusCode(findClass.statusCode).send(findClass);

    const res = await this.classService.updateById(classId, body);
    response.status(res.statusCode).send(res);
  }

  @Delete(`${defaultPath}/:classId`)
  @HttpCode(200)
  async deleteClass(@Param('classId') classId: string, @Res() response) {
    const res = await this.classService.delete(classId);
    response.status(res.statusCode).send(res);
  }

  @Delete(`${defaultPath}/:classId/leave`)
  async leaveClass(
    @Param('classId') classId: string | Types.ObjectId,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    classId = toMongoObjectId({ value: classId, key: 'classId' });

    // check permission
    const findUserJoinClass = await this.userJoinClassService.findOne({
      classId,
      deletedAt: null,
      userId,
    });

    if (findUserJoinClass.statusCode !== 200)
      return response
        .status(findUserJoinClass.statusCode)
        .send(findUserJoinClass);

    const res = await this.userJoinClassService.deleteOne({
      classId,
      deletedAt: null,
      userId,
    });

    response.status(res.statusCode).send(res);
  }
}
