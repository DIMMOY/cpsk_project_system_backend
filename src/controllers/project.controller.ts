import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Query,
  Res,
  Put,
  Req,
} from '@nestjs/common';
import { request } from 'http';
import { Types } from 'mongoose';
import { ProjectCreateDto } from 'src/dto/project.dto';
import { ClassService } from 'src/services/class.service';
import { ProjectService } from 'src/services/project.service';
import { ProjectHasUserService } from 'src/services/projectHasUser.service';
import { UserJoinClassService } from 'src/services/userJoinClass.service';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

const defaultPath = 'project';

@Controller()
export class ProjectController {
  constructor(
    private readonly projectService: ProjectService,
    private readonly projectHasUserService: ProjectHasUserService,
    private readonly classService: ClassService,
    private readonly userJoinClassService: UserJoinClassService,
  ) {}

  @Post(`class/:classId/${defaultPath}`)
  async createProject(
    @Param('classId') classId: Types.ObjectId,
    @Body() reqBody: ProjectCreateDto,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    const { partners, advisors } = reqBody;

    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    if (partners.filter((v) => v.toString() === userId.toString()).length) {
      return response
        .status(400)
        .send({ statusCode: 400, message: 'Owner And Partner Has Same Id' });
    }

    // find class has user
    classId = toMongoObjectId({ value: classId, key: 'classId' });
    const findClass = await this.userJoinClassService.list({
      userId: { $in: [userId, ...partners] },
      classId,
      deletedAt: null,
    });
    if (findClass.statusCode !== 200) {
      return response.status(findClass.statusCode).send(findClass);
    }
    if (findClass.data.length !== [userId, ...partners].length) {
      return response
        .status(404)
        .send({ statusCode: 404, message: 'User In Class Not Found' });
    }

    // find user not in other project
    const findUser = await this.projectHasUserService.list({
      userId,
      classId,
      deletedAt: null,
    });
    if (findUser.statusCode !== 200) {
      return response.status(findUser.statusCode).send(findUser);
    }
    if (findUser.data.length) {
      return response
        .status(403)
        .send({ statusCode: 403, message: 'User Has Already In Project ' });
    }

    const res = await this.projectService.create({
      ...reqBody,
      classId,
      userId,
    });
    response.status(res.statusCode).send(res);
  }

  @Get(`class/:classId/${defaultPath}`)
  async listProjectInClass(
    @Param('classId') classId: string,
    @Query('sort') sort: string,
    @Query('matchCommitteeId') matchCommitteeId: string,
    @Req() request,
    @Res() response,
  ) {
    const { role } = request;

    const projects = await this.projectService.list(sort, {
      classId: toMongoObjectId({ value: classId, key: 'classId' }),
      deletedAt: null,
    });
    if (projects.statusCode !== 200)
      return response.status(projects.statusCode).send(projects);

    const projectsOb = {};
    projects.data.forEach((project) => {
      projectsOb[project._id] = {
        ...project._doc,
        student: [],
        advisor: [],
        committeeGroupId: null,
        committee: [],
      };
    });

    const projectHasUsers = await this.projectHasUserService.list({
      classId: toMongoObjectId({ value: classId, key: 'classId' }),
      deletedAt: null,
      isAccept: true,
    });
    if (projectHasUsers.statusCode !== 200)
      return response.status(projectHasUsers.statusCode).send(projectHasUsers);

    projectHasUsers.data.forEach((projectHasUser) => {
      if (projectHasUser.role === 0 || projectHasUser.role === 1) {
        projectsOb[projectHasUser.projectId].student.push(
          projectHasUser.userId,
        );
      } else if (projectHasUser.role === 2) {
        projectsOb[projectHasUser.projectId].advisor.push(
          projectHasUser.userId,
        );
      } else {
        // role 3 (committee) will have matchCommitteId in projectHasUser table
        if (matchCommitteeId) {
          if (
            matchCommitteeId === projectHasUser.matchCommitteeId._id.toString()
          ) {
            projectsOb[projectHasUser.projectId].committee.push(
              projectHasUser.userId,
            );
            projectsOb[projectHasUser.projectId].committeeGroupId =
              projectHasUser.matchCommitteeHasGroupId;
          }
        } else {
          projectsOb[projectHasUser.projectId].committee.push(
            projectHasUser.userId,
          );
        }
      }
    });

    const result: any = Object.values(projectsOb);
    if (sort === 'advisor') {
      result.sort((a, b) => {
        if (!a.advisor.length) {
          return 1;
        } else if (!b.advisor.length) {
          return 1;
        } else {
          return a.advisor[0].displayName.localeCompare(
            b.advisor[0].displayName,
          );
        }
      });
    } else if (sort === 'committee' && matchCommitteeId) {
      result.sort((a, b) => {
        if (!a.committeeGroupId) {
          return 1;
        } else if (!b.committeeGroupId) {
          return 1;
        } else {
          return a.committeeGroupId.createdAt.getTime() <
            b.committeeGroupId.createdAt.getTime()
            ? -1
            : 1;
        }
      });
    }

    response.status(projects.statusCode).send({
      statusCode: projects.statusCode,
      message: projects.message,
      data: result,
    });
  }

  @Get(`class/:classId/${defaultPath}/:projectId`)
  async getProjectInClass(
    @Param('classId') classId: string,
    @Param('projectId') projectId: string,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    const { role } = request;

    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    // is not admin (for advisor)
    if (!role.find((e) => e === 2)) {
      const findPermission = await this.projectHasUserService.findOne({
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        userId: toMongoObjectId({ value: userId, key: 'userId' }),
        projectId: toMongoObjectId({ value: projectId, key: 'projectId' }),
        deletedAt: null,
      });
      if (!findPermission.data) {
        return response
          .status(403)
          .send({ statusCode: 403, message: 'Permission Denied' });
      }
      response.status(200).send({
        statusCode: 200,
        message: 'Find Project Successful',
        data: findPermission.data.projectId,
      });
    } else {
      const project = await this.projectService.findOne({
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        _id: toMongoObjectId({ value: projectId, key: 'projectId' }),
        deletedAt: null,
      });
      response.status(project.statusCode).send(project);
    }
  }

  @Get(`class/:classId/student/${defaultPath}`)
  async getProjectInClassForStudent(
    @Param('classId') classId: string,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    const res = await this.projectHasUserService.findOne({
      userId,
      classId: toMongoObjectId({ value: classId, key: 'classId' }),
      deletedAt: null,
      role: { $in: [0, 1] },
    });
    response.status(res.statusCode).send(res);
  }

  @Get(`class/:classId/${defaultPath}/:projectId/role`)
  async checkRoleInProject(
    @Param('classId') classId: string,
    @Param('projectId') projectId: string,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    const res = await this.projectHasUserService.list(
      {
        userId,
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        projectId: toMongoObjectId({ value: projectId, key: 'classId' }),
        deletedAt: null,
      },
      { role: 1, _id: 0 },
    );
    const { statusCode, message } = res;
    response
      .status(statusCode)
      .send({ statusCode, message, data: res.data.map((e) => e.role) });
  }

  @Put(`class/:classId/${defaultPath}/:projectId`)
  async updateProject(
    @Param('classId') classId: Types.ObjectId,
    @Param('projectId') projectId: Types.ObjectId,
    @Body() projectCreateDto: ProjectCreateDto,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    classId = toMongoObjectId({ value: classId, key: 'classId' });
    projectId = toMongoObjectId({ value: projectId, key: 'projectId' });

    const res = await this.projectService.create({
      ...projectCreateDto,
      classId,
      userId,
    });
    response.status(res.statusCode).send(res);
  }
}
