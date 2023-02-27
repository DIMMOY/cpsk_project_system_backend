import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import {
  AssessmentCreateDto,
  AssessmentUpdateDto,
} from 'src/dto/assessment.dto';
import {
  ClassHasAssessmentBodyDto,
  ClassHasAssessmentStatusBodyDto,
} from 'src/dto/classHasAssessment.dto';
import { AssessmentService } from 'src/services/assessment.service';
import { ClassHasAssessmentService } from 'src/services/classHasAssessment.service';
import { ProjectHasUserService } from 'src/services/projectHasUser.service';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

const defaultPath = 'assessment';

@Controller()
export class AssessmentController {
  constructor(
    private readonly assessmentService: AssessmentService,
    private readonly classHasAssessmentService: ClassHasAssessmentService,
    private readonly projectHasUserService: ProjectHasUserService,
  ) {}

  @Get(defaultPath)
  async listAssessment(@Query('sort') sort: string, @Res() response) {
    const res = await this.assessmentService.list(sort, { deletedAt: null });
    response.status(res.statusCode).send(res);
  }

  @Get(`class/:classId/${defaultPath}`)
  async listAssessmentInClass(
    @Param('classId') classId: string,
    @Query('sort') sort: string,
    @Query('status') status: string,
    @Req() request,
    @Res() response,
  ) {
    const { role } = request;
    // if not admin, can find only status is true
    if (!role.find((e) => e === 2) && status !== 'true')
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    // list all meeting schedules
    const assessments = await this.assessmentService.list(sort, {
      deletedAt: null,
    });
    if (assessments.statusCode !== 200)
      return response.status(assessments.statusCode).send(assessments);

    // list meeting schedule in class
    const classHasAssessments = await this.classHasAssessmentService.list(
      sort,
      {
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        status: true,
        deletedAt: null,
      },
    );
    if (classHasAssessments.statusCode !== 200)
      return response
        .status(classHasAssessments.statusCode)
        .send(classHasAssessments);

    // filter data
    const data = [];
    for (let i = 0; i < assessments.data.length; i++) {
      const {
        _id,
        name,
        description,
        form,
        score,
        feedBack,
        autoCalculate,
        assessBy,
        createdAt,
        updatedAt,
      } = assessments.data[i];
      const findData = classHasAssessments.data.find(
        (e) => e.assessmentId?._id.toString() === _id?.toString(),
      );
      const statusInClass = findData ? true : false;
      const startDate = findData ? findData.startDate : null;
      const endDate = findData ? findData.endDate : null;
      const openedAt = findData ? findData.updatedAt : null;
      const matchCommitteeId = findData ? findData.matchCommitteeId : null;
      data.push({
        _id,
        name,
        description,
        form,
        score,
        feedBack,
        autoCalculate,
        assessBy,
        createdAt,
        updatedAt,
        statusInClass,
        openedAt,
        startDate,
        endDate,
        matchCommitteeId,
      });
    }

    const filterData =
      status === 'true'
        ? data.filter((e) => e.statusInClass === true)
        : status === 'false'
        ? data.filter((e) => e.statusInClass === false)
        : data;
    // ==========

    response.status(200).send({
      statusCode: assessments.statusCode,
      message: assessments.message,
      data: filterData,
    });
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

  @Put(`class/:classId/${defaultPath}/:assessmentId/date`)
  async setDateMeetingScheduleInClass(
    @Param('classId') classId: string,
    @Param('assessmentId') assessmentId: string,
    @Body() body: ClassHasAssessmentBodyDto,
    @Res() response,
  ) {
    const res = await this.classHasAssessmentService.createOrUpdate({
      ...body,
      classId,
      assessmentId,
    });
    response.status(res.statusCode).send(res);
  }

  @Patch(`class/:classId/${defaultPath}/:assessmentId/date/status`)
  async changeMeetingScheduleInClass(
    @Param('classId') classId: string,
    @Param('assessmentId') assessmentId: string,
    @Body() body: ClassHasAssessmentStatusBodyDto,
    @Res() response,
  ) {
    const res = await this.classHasAssessmentService.updateStatus({
      ...body,
      classId,
      assessmentId,
    });
    response.status(res.statusCode).send(res);
  }

  //   @Delete(`${defaultPath}/:id`)
  //   @HttpCode(200)
  //   async deleteClass(@Param('id') id: string) {
  //     return await this.classService.delete(id);
  //   }
}
