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
import { Types } from 'mongoose';
import {
  AssessmentCreateDto,
  AssessmentUpdateDto,
} from 'src/dto/assessment.dto';
import {
  ClassHasAssessmentBodyDto,
  ClassHasAssessmentStatusBodyDto,
} from 'src/dto/classHasAssessment.dto';
import { ProjectHasAssessmentCreateDto } from 'src/dto/projectHasAssessment.dto';
import { AssessmentService } from 'src/services/assessment.service';
import { ClassHasAssessmentService } from 'src/services/classHasAssessment.service';
import { ProjectService } from 'src/services/project.service';
import { ProjectHasAssessmentService } from 'src/services/projectHasAssessment.service';
import { ProjectHasUserService } from 'src/services/projectHasUser.service';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

const defaultPath = 'assessment';

@Controller()
export class AssessmentController {
  constructor(
    private readonly assessmentService: AssessmentService,
    private readonly classHasAssessmentService: ClassHasAssessmentService,
    private readonly projectHasUserService: ProjectHasUserService,
    private readonly projectHasAssessmentService: ProjectHasAssessmentService,
    private readonly projectService: ProjectService,
  ) {}

  @Get(`class/:classId/${defaultPath}/:assessmentId/project/:projectId`)
  async getAssessmentFromProject(
    @Param('classId') classId: string | Types.ObjectId,
    @Param('assessmentId') assessmentId: string | Types.ObjectId,
    @Param('projectId') projectId: string | Types.ObjectId,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;

    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    classId = toMongoObjectId({ value: classId, key: 'classId' });
    assessmentId = toMongoObjectId({
      value: assessmentId,
      key: 'assessmentId',
    });
    projectId = toMongoObjectId({ value: projectId, key: 'projectId' });

    // find project
    const findProject = await this.projectService.findOne({
      _id: projectId,
      classId,
      deletedAt: null,
    });
    if (findProject.statusCode !== 200)
      return response.status(findProject.statusCode).send(findProject);

    // find assessment
    const findAssessment = await this.classHasAssessmentService.findOne({
      classId,
      assessmentId,
      deletedAt: null,
      status: true,
    });
    if (findAssessment.statusCode !== 200)
      return response.status(findAssessment.statusCode).send(findAssessment);

    const data = { classHasAssessment: {}, project: {} };
    data.classHasAssessment = findAssessment.data;

    response.status(findAssessment.statusCode).send({
      statusCode: findAssessment.statusCode,
      message: findAssessment.message,
      data,
    });
  }

  @Get(defaultPath)
  async listAssessment(@Query('sort') sort: string, @Res() response) {
    const res = await this.assessmentService.list(sort, { deletedAt: null });
    response.status(res.statusCode).send(res);
  }

  @Get(`class/:classId/assessment`)
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

    // list all assessments
    const assessments = await this.assessmentService.list(sort, {
      deletedAt: null,
    });
    if (assessments.statusCode !== 200)
      return response.status(assessments.statusCode).send(assessments);

    // list assessments in class
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

  @Get(`class/:classId/assessment/overview`)
  async listProjectHasAssessmentInClass(
    @Param('classId') classId: string | Types.ObjectId,
    @Query('id') assessmentId: string | Types.ObjectId,
    @Query('role') roleInProject: number,
    @Query('matchCommitteeId') matchCommitteeId: string | Types.ObjectId,
    @Query('sort') sort: string,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    const { role, currentRole } = request;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    if (roleInProject !== 2 && roleInProject !== 3) {
      return response
        .status(400)
        .send({ statusCode: 400, message: 'Role should be 2 or 3' });
    }

    if (roleInProject === 2 && matchCommitteeId) {
      return response
        .status(400)
        .send({ statusCode: 400, message: 'Query Not Found' });
    }

    if (roleInProject === 3 && !matchCommitteeId) {
      return response
        .status(400)
        .send({ statusCode: 400, message: 'Query Not Found' });
    }

    classId = toMongoObjectId({ value: classId, key: 'classId' });

    if (matchCommitteeId) {
      matchCommitteeId = toMongoObjectId({
        value: matchCommitteeId,
        key: 'matchCommitteeId',
      });
    }

    let checkAssessment = null;
    let classHasAssessmentId = null;
    let assessment = null;
    if (assessmentId) {
      assessmentId = toMongoObjectId({
        value: assessmentId,
        key: 'assessmentId',
      });

      if (roleInProject === 3 && matchCommitteeId) {
        checkAssessment = await this.classHasAssessmentService.findOne({
          classId,
          assessmentId,
          deletedAt: null,
          status: true,
          matchCommitteeId,
        });
      } else {
        checkAssessment = await this.classHasAssessmentService.findOne({
          classId,
          assessmentId,
          deletedAt: null,
          status: true,
        });
      }
      if (checkAssessment.statusCode !== 200)
        return response
          .status(checkAssessment.statusCode)
          .send(checkAssessment);
      classHasAssessmentId = checkAssessment.data._id;
      assessment = {
        ...checkAssessment.data.assessment._doc,
        matchCommitteeId: checkAssessment.data.matchCommitteeId,
      };

      if (roleInProject === 2 && assessment.assessBy === 2) {
        // role is advisor but assessment can assess only committee
        return response
          .status(404)
          .send({ statusCode: 404, message: 'Project Not Found' });
      }
      if (roleInProject === 3 && assessment.assessBy === 1) {
        // role is committee but assessment can assess only advisor
        return response
          .status(404)
          .send({ statusCode: 404, message: 'Project Not Found' });
      }
      if (roleInProject !== 2 && roleInProject !== 3) {
        return response
          .status(400)
          .send({ statusCode: 400, message: 'role should be a number 2 or 3' });
      }

      const projectsOb: any = {};

      const projects = await this.projectService.list(sort, {
        classId,
        deletedAt: null,
      });
      if (projects.statusCode !== 200)
        return response.status(projects.statusCode).send(projects);

      // if not admin or current role is advisor
      let projectHasUsers;
      if (!role.find((e) => e === 2) || currentRole === 1) {
        projectHasUsers = await this.projectHasUserService.list({
          role: roleInProject,
          matchCommitteeId,
          userId,
          classId,
          isAccept: true,
          deletedAt: null,
        });
        if (projectHasUsers.statusCode !== 200)
          return response
            .status(projectHasUsers.statusCode)
            .send(projectHasUsers);
        projects.data
          .filter((project) =>
            projectHasUsers.data.find(
              (p) => p.projectId.toString() === project._id.toString(),
            ),
          )
          .forEach((project) => {
            projectsOb[project._id] = {
              ...project._doc,
              assessmentResults: [],
              students: [],
            };
          });
      } else {
        projects.data.forEach((project) => {
          projectsOb[project._id] = {
            ...project._doc,
            assessmentResults: [],
            students: [],
          };
        });
      }

      const assessBy = roleInProject === 2 ? 1 : 2;

      const filter =
        roleInProject === 2
          ? {
              classHasAssessmentId,
              deletedAt: null,
              assessBy,
            }
          : {
              classHasAssessmentId,
              deletedAt: null,
              assessBy,
              matchCommitteeId,
            };
      const findProjectHasAssessment =
        await this.projectHasAssessmentService.list('createdAtASC', filter);
      if (findProjectHasAssessment.statusCode !== 200)
        return response
          .status(findProjectHasAssessment.statusCode)
          .send(findProjectHasAssessment);
      findProjectHasAssessment.data.forEach((data) => {
        if (projectsOb[data.projectId]) {
          projectsOb[data.projectId].assessmentResults.push(data);
        }
      });

      const studentInClass = await this.projectHasUserService.list({
        classId,
        role: { $in: [0, 1] },
        deletedAt: null,
      });
      if (studentInClass.statusCode !== 200)
        response.status(studentInClass.statusCode).send(studentInClass);
      studentInClass.data.forEach((data) => {
        if (projectsOb[data.projectId]) {
          projectsOb[data.projectId].students.push(data.userId);
        }
      });

      response.status(findProjectHasAssessment.statusCode).send({
        statusCode: findProjectHasAssessment.statusCode,
        message: findProjectHasAssessment.message,
        data: { assessment, project: Object.values(projectsOb) },
      });
    } else {
      return response
        .status(404)
        .send({ statusCode: 404, message: 'Assessment Not Found' });
    }
  }

  @Get(`class/:classId/${defaultPath}/:assessmentId/project/:projectId/form`)
  async getProjectHasAssessmentInClass(
    @Param('classId') classId: string | Types.ObjectId,
    @Param('assessmentId') assessmentId: string | Types.ObjectId,
    @Param('projectId') projectId: string | Types.ObjectId,
    @Query('role') roleInProject: number,
    @Query('matchCommitteeId') matchCommitteeId: string | Types.ObjectId,
    @Query('sort') sort: string,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    const { role, currentRole } = request;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    if (roleInProject !== 2 && roleInProject !== 3) {
      return response
        .status(400)
        .send({ statusCode: 400, message: 'Role should be 2 or 3' });
    }

    if (roleInProject === 2 && matchCommitteeId) {
      return response
        .status(400)
        .send({ statusCode: 400, message: 'Query Not Found' });
    }

    if (roleInProject === 3 && !matchCommitteeId) {
      return response
        .status(400)
        .send({ statusCode: 400, message: 'Query Not Found' });
    }

    classId = toMongoObjectId({ value: classId, key: 'classId' });
    assessmentId = toMongoObjectId({
      value: assessmentId,
      key: 'assessmentId',
    });
    projectId = toMongoObjectId({ value: projectId, key: 'projectId' });
    if (matchCommitteeId) {
      matchCommitteeId = toMongoObjectId({
        value: matchCommitteeId,
        key: 'matchCommitteeId',
      });
    }

    let findClassHasAssessment = null;
    if (roleInProject === 3) {
      // filter with matchCommitteeId
      findClassHasAssessment = await this.classHasAssessmentService.findOne({
        classId,
        assessmentId,
        deletedAt: null,
        status: true,
        matchCommitteeId,
      });
    } else {
      findClassHasAssessment = await this.classHasAssessmentService.findOne({
        classId,
        assessmentId,
        deletedAt: null,
        status: true,
      });
    }
    if (findClassHasAssessment.statusCode !== 200)
      return response
        .status(findClassHasAssessment.statusCode)
        .send(findClassHasAssessment);

    const { _id: classHasAssessmentId } = findClassHasAssessment.data;
    const { assessBy } = findClassHasAssessment.data.assessment;

    // if not admin or current role is advisor
    if (!role.find((e) => e === 2) || currentRole === 1) {
      const checkPermission = await this.projectHasUserService.findOne({
        role: roleInProject,
        matchCommitteeId,
        projectId,
        userId,
        isAccept: true,
        deletedAt: null,
      });
      if (checkPermission.statusCode !== 200)
        return response
          .status(403)
          .send({ statusCode: 403, message: 'Permission Denied' });
      const { role } = checkPermission.data;
      if (assessBy === 1 && role === 3) {
        // assessBy advisor only, but user is committee
        return response
          .status(403)
          .send({ statusCode: 403, message: 'Permission Denied' });
      } else if (assessBy === 2 && role === 2) {
        // assessBy committee only, but user is advisor
        return response
          .status(403)
          .send({ statusCode: 403, message: 'Permission Denied' });
      }
    }

    const project = await this.projectService.findOne({
      _id: projectId,
      classId,
      deletedAt: null,
    });
    if (project.statusCode !== 200)
      return response.status(project.statusCode).send(project);

    const projectHasAssessment = await this.projectHasAssessmentService.list(
      'createdAtASC',
      {
        projectId,
        classHasAssessmentId,
        deletedAt: null,
        matchCommitteeId: roleInProject === 2 ? null : matchCommitteeId,
      },
    );
    if (projectHasAssessment.statusCode !== 200)
      return response
        .status(projectHasAssessment.statusCode)
        .send(projectHasAssessment);

    response.status(projectHasAssessment.statusCode).send({
      statusCode: projectHasAssessment.statusCode,
      message: projectHasAssessment.message,
      data: {
        ...findClassHasAssessment.data._doc,
        project: project.data,
        assessmentResults: projectHasAssessment.data,
      },
    });
  }

  @Get(`project/:projectId/${defaultPath}/:assessmentId`)
  async listAllProjectHasAssessmentInProject(
    @Param('assessmentId') assessmentId: string | Types.ObjectId,
    @Param('projectId') projectId: string | Types.ObjectId,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    const { currentRole } = request;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    assessmentId = toMongoObjectId({
      value: assessmentId,
      key: 'assessmentId',
    });
    projectId = toMongoObjectId({ value: projectId, key: 'projectId' });

    let classId;
    // find project and permission
    if (currentRole === 2) {
      const findProject = await this.projectService.findOne({
        _id: projectId,
        deletedAt: null,
      });
      if (findProject.statusCode !== 200)
        return response.status(findProject.statusCode).send(findProject);
      classId = findProject.data.classId;
    } else {
      const findProject = await this.projectHasUserService.findOne({
        projectId,
        userId,
        deletedAt: null,
      });
      if (findProject.statusCode !== 200)
        return response.status(findProject.statusCode).send(findProject);
      classId = findProject.data.classId._id;
    }

    // find class has assessment
    const findClassHasAssessment = await this.classHasAssessmentService.findOne(
      {
        classId,
        assessmentId,
        deletedAt: null,
        status: true,
      },
    );
    if (findClassHasAssessment.statusCode !== 200)
      return response
        .status(findClassHasAssessment.statusCode)
        .send(findClassHasAssessment);

    const classHasAssessmentId = findClassHasAssessment.data._id;

    const listData = await this.projectHasAssessmentService.list(
      'createdAtDESC',
      {
        projectId,
        classHasAssessmentId,
        deletedAt: null,
      },
      { classHasAssessmentId: 0 },
    );
    if (listData.statusCode !== 200)
      return response.status(listData.statusCode).send(listData);

    const newListData = [...listData.data];
    newListData.forEach((_, index) => {
      delete newListData[index].classHasAssessmentId;
    });

    // if currentRole is student
    if (currentRole === 0) {
      response.status(listData.statusCode).send({
        statusCode: listData.statusCode,
        message: listData.message,
        data: newListData
          .map((data) => {
            if (data.assessBy === 1) {
              return {
                assessBy: data.assessBy,
                sumScore: data.sumScore,
                userId: data.userId,
              };
            } else {
              return {
                assessBy: data.assessBy,
                sumScore: data.sumScore,
                matchCommitteeId: data.matchCommitteeId,
              };
            }
          })
          .sort((a, b) => a.assessBy - b.assessBy),
      });
    } else {
      response.status(listData.statusCode).send({
        statusCode: listData.statusCode,
        message: listData.message,
        data: newListData,
      });
    }
  }

  @Get(`class/:classId/${defaultPath}/detail`)
  async getAssessmentInClass(
    @Param('classId') classId: string | Types.ObjectId,
    @Query('id') assessmentId: string | Types.ObjectId,
    @Req() request,
    @Res() response,
  ) {
    classId = toMongoObjectId({ value: classId, key: 'classId' });
    assessmentId = toMongoObjectId({
      value: assessmentId,
      key: 'assessmentId',
    });

    // get assessment in class
    const classHasAssessments = await this.classHasAssessmentService.findOne({
      classId,
      assessmentId,
      status: true,
      deletedAt: null,
    });
    if (classHasAssessments.statusCode !== 200)
      return response
        .status(classHasAssessments.statusCode)
        .send(classHasAssessments);

    const matchCommitteeId = classHasAssessments.data.matchCommitteeId.filter(
      (data) => data.status === true,
    );

    response.status(200).send({
      statusCode: classHasAssessments.statusCode,
      message: classHasAssessments.message,
      data: { ...classHasAssessments.data._doc, matchCommitteeId },
    });
  }

  @Post(defaultPath)
  async createAssessment(@Body() body: AssessmentCreateDto, @Res() response) {
    const res = await this.assessmentService.create(body);
    response.status(res.statusCode).send(res);
  }

  @Post(`project/:projectId/${defaultPath}/:assessmentId`)
  async createSendAssessment(
    @Param('projectId') projectId: string | Types.ObjectId,
    @Param('assessmentId') assessmentId: string | Types.ObjectId,
    @Query('matchCommitteeId') matchCommitteeId: string | Types.ObjectId | null,
    @Query('role') roleInProject: number,
    @Body() body: ProjectHasAssessmentCreateDto,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    projectId = toMongoObjectId({ value: projectId, key: 'projectId' });
    assessmentId = toMongoObjectId({
      value: assessmentId,
      key: 'assessmentId',
    });

    if (roleInProject === 3 && !matchCommitteeId) {
      return response
        .status(400)
        .send({ statusCode: 400, message: 'MatchCommittee Id Not Found' });
    }

    if (matchCommitteeId)
      matchCommitteeId = toMongoObjectId({
        value: matchCommitteeId,
        key: 'matchCommitteeId',
      });

    // check project
    const findProject = await this.projectService.findOne({
      id: projectId,
      deletedAt: null,
    });
    if (findProject.statusCode !== 200)
      return response.status(findProject.statusCode).send(findProject);

    // check permission
    const checkPermission = await this.projectHasUserService.findOne({
      projectId,
      userId,
      deletedAt: null,
      role: roleInProject,
      isAccept: true,
      matchCommitteeId,
    });
    if (checkPermission.statusCode !== 200)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    const classId = findProject.data.classId;
    const checkAssessment = await this.classHasAssessmentService.findOne({
      classId,
      assessmentId,
      deletedAt: null,
      status: true,
    });
    if (checkAssessment.statusCode !== 200)
      return response.status(checkAssessment.statusCode).send(checkAssessment);

    const { _id: classHasAssessmentId } = checkAssessment.data;
    const { limitScore } = checkAssessment.data.assessment;

    const res = await this.projectHasAssessmentService.createOrUpdate({
      projectId,
      classHasAssessmentId,
      userId,
      limitScore,
      ...body,
      assessBy: roleInProject === 2 ? 1 : 2,
      matchCommitteeId: matchCommitteeId ? matchCommitteeId : null,
    });
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
  async setDateAssessmentInClass(
    @Param('classId') classId: string | Types.ObjectId,
    @Param('assessmentId') assessmentId: string | Types.ObjectId,
    @Body() body: ClassHasAssessmentBodyDto,
    @Res() response,
  ) {
    classId = toMongoObjectId({ value: classId, key: 'classId' });
    assessmentId = toMongoObjectId({
      value: assessmentId,
      key: 'assessmentId',
    });

    const firstTime = await this.classHasAssessmentService.findOne({
      classId,
      assessmentId,
      deletedAt: null,
    });

    // first time
    let assessment = null;
    if (firstTime.statusCode === 404) {
      const findAssessment = await this.assessmentService.findOne({
        _id: assessmentId,
        deletedAt: null,
      });
      if (findAssessment.statusCode !== 200)
        return response.status(findAssessment.statusCode).send(findAssessment);
      assessment = findAssessment.data;
    } else if (firstTime.statusCode !== 200)
      return response.status(firstTime.statusCode).send(firstTime);

    const reqBody: {
      startDate: Date;
      endDate: Date;
      matchCommitteeId: Array<Types.ObjectId>;
      assessment?: any;
    } = { ...body };
    if (assessment) reqBody.assessment = assessment;

    const res = await this.classHasAssessmentService.createOrUpdate({
      ...reqBody,
      classId,
      assessmentId,
    });
    response.status(res.statusCode).send(res);
  }

  @Patch(`class/:classId/${defaultPath}/:assessmentId/date/status`)
  async changeAssessmentInClass(
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

  @Delete(`/assessment/form/:formId`)
  async deleteSendAssessment(
    @Param('formId') formId: string | Types.ObjectId,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    formId = toMongoObjectId({ value: formId, key: 'formId' });

    const findSendAssessment = await this.projectHasAssessmentService.findOne({
      _id: formId,
      deletedAt: null,
    });

    if (findSendAssessment.statusCode !== 200) {
      return response
        .status(findSendAssessment.statusCode)
        .send(findSendAssessment);
    } else if (
      findSendAssessment.data.userId.toString() !== userId.toString()
    ) {
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });
    }

    const res = await this.projectHasAssessmentService.delete({
      _id: formId,
      deletedAt: null,
    });
    response.status(res.statusCode).send(res);
  }
}
