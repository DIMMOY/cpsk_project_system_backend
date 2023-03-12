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
  Patch,
  Delete,
} from '@nestjs/common';
import { projectID } from 'firebase-functions/params';
import { request } from 'http';
import { Types } from 'mongoose';
import {
  ProjectAcceptDto,
  ProjectCreateDto as ProjectUpdateDto,
} from 'src/dto/project.dto';
import { ClassService } from 'src/services/class.service';
import { ProjectService } from 'src/services/project.service';
import { ProjectHasUserService } from 'src/services/projectHasUser.service';
import { UserService } from 'src/services/user.service';
import { UserHasRoleService } from 'src/services/userHasRole.service';
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
    private readonly userHasRoleService: UserHasRoleService,
  ) {}

  @Post(`class/:classId/${defaultPath}`)
  async createProject(
    @Param('classId') classId: Types.ObjectId,
    @Body() reqBody: ProjectUpdateDto,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    const { partners, advisors } = reqBody;

    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    // if (partners.filter((v) => v.toString() === userId.toString()).length) {
    //   return response
    //     .status(400)
    //     .send({ statusCode: 400, message: 'Owner And Partner Has Same Id' });
    // }

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

    // find advisor
    const findAdvisor = await this.userHasRoleService.list({
      userId: { $in: advisors },
      deletedAt: null,
      role: 1,
    });
    if (findAdvisor.statusCode !== 200) {
      return response.status(findAdvisor.statusCode).send(findAdvisor);
    }
    if (findAdvisor.data.length !== advisors.length) {
      return response
        .status(404)
        .send({ statusCode: 404, message: 'Advisor Not Found' });
    }

    // find user not in other project
    const findUser = await this.projectHasUserService.list({
      userId,
      classId,
      deletedAt: null,
      role: { $in: [0, 1] },
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
    @Query('role') roleInProject: string,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    const { role, currentRole } = request;

    const projects = await this.projectService.list(sort, {
      classId: toMongoObjectId({ value: classId, key: 'classId' }),
      deletedAt: null,
    });
    if (projects.statusCode !== 200)
      return response.status(projects.statusCode).send(projects);

    const projectsOb: any = {};
    let filter;

    // if not admin
    if (!role.find((e) => e === 2) || currentRole === 1) {
      let projectHasUsers;
      if (roleInProject === 'advisor') {
        projectHasUsers = await this.projectHasUserService.list({
          role: 2,
          userId,
          classId: toMongoObjectId({ value: classId, key: 'classId' }),
          deletedAt: null,
        });
        if (projectHasUsers.statusCode !== 200)
          return response
            .status(projectHasUsers.statusCode)
            .send(projectHasUsers);
      } else if (roleInProject === 'committee') {
        projectHasUsers = await this.projectHasUserService.list({
          role: 3,
          userId,
          classId: toMongoObjectId({ value: classId, key: 'classId' }),
          matchCommitteeId: toMongoObjectId({
            value: matchCommitteeId,
            key: 'matchCommitteeId',
          }),
          deletedAt: null,
        });
        if (projectHasUsers.statusCode !== 200)
          return response
            .status(projectHasUsers.statusCode)
            .send(projectHasUsers);
      } else {
        return response
          .status(404)
          .send({ statusCode: 404, message: 'Query Not Found' });
      }

      const filterProject = projects.data.filter((project) =>
        projectHasUsers.data.find(
          (p) => p.projectId.toString() === project._id.toString(),
        ),
      );
      filterProject.forEach((project) => {
        projectsOb[project._id] = {
          ...project._doc,
          student: [],
          advisor: [],
          committeeGroupId: null,
          committee: [],
          startDate: null,
          isAccept: null,
        };
      });
      filter = {
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        deletedAt: null,
        projectId: { $in: filterProject.map((project) => project._id) },
      };
    } else {
      projects.data.forEach((project) => {
        projectsOb[project._id] = {
          ...project._doc,
          student: [],
          advisor: [],
          committeeGroupId: null,
          committee: [],
          startDate: null,
        };
      });
      filter = {
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        deletedAt: null,
        isAccept: true,
      };
    }

    if (Object.values(projectsOb).length) {
      const projectHasUsers = await this.projectHasUserService.list(filter);
      if (projectHasUsers.statusCode !== 200)
        return response
          .status(projectHasUsers.statusCode)
          .send(projectHasUsers);

      projectHasUsers.data.forEach((projectHasUser) => {
        if (projectHasUser.role === 0 || projectHasUser.role === 1) {
          projectsOb[projectHasUser.projectId].student.push({
            ...projectHasUser.userId._doc,
            isAccept: projectHasUser.isAccept,
          });
        } else if (projectHasUser.role === 2) {
          projectsOb[projectHasUser.projectId].advisor.push({
            ...projectHasUser.userId._doc,
            isAccept: projectHasUser.isAccept,
          });
        } else {
          // role 3 (committee) will have matchCommitteId in projectHasUser table
          if (matchCommitteeId) {
            if (
              matchCommitteeId ===
              projectHasUser.matchCommitteeId._id.toString()
            ) {
              projectsOb[projectHasUser.projectId].committee.push({
                ...projectHasUser.userId._doc,
                isAccept: projectHasUser.isAccept,
              });
              projectsOb[projectHasUser.projectId].committeeGroupId =
                projectHasUser.matchCommitteeHasGroupId;
              projectsOb[projectHasUser.projectId].startDate =
                projectHasUser.startDate;
            }
          } else {
            projectsOb[projectHasUser.projectId].committee.push(
              projectHasUser.userId,
            );
          }
        }
      });
    }

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
    if (res.statusCode !== 200)
      return response.status(res.statusCode).send(res);

    const projectData = res.data.projectId;
    const { _id: projectId } = projectData;
    const projectHasUsers = await this.projectHasUserService.list({
      classId: toMongoObjectId({ value: classId, key: 'classId' }),
      projectId,
      deletedAt: null,
    });
    if (projectHasUsers.statusCode !== 200)
      return response.status(projectHasUsers.statusCode).send(projectHasUsers);

    const advisors = projectHasUsers.data
      .filter((e) => e.role === 2)
      .map((e) => e.userId);
    const partners = projectHasUsers.data
      .filter(
        (e) =>
          (e.role === 0 || e.role === 1) &&
          e.userId._id.toString() !== userId.toString(),
      )
      .map((e) => e.userId);
    const committees = projectHasUsers.data
      .filter(
        (e) => e.role === 3 && e.userId._id.toString() !== userId.toString(),
      )
      .map((e) => ({ ...e.userId._doc, matchCommitteeId: e.matchCommitteeId }));
    response.status(res.statusCode).send({
      statusCode: res.statusCode,
      message: res.message,
      data: { ...projectData._doc, advisors, partners, committees },
    });
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
      { role: 1, _id: 0, matchCommitteId: 1 },
    );
    const { statusCode, message } = res;
    response.status(statusCode).send({
      statusCode,
      message,
      data: res.data.map((e) => ({
        role: e.role,
        matchCommitteeId: e.matchCommitteeId ? e.matchCommitteeId._id : null,
      })),
    });
  }

  @Put(`class/:classId/${defaultPath}/:projectId`)
  async updateProject(
    @Param('classId') classId: Types.ObjectId,
    @Param('projectId') projectId: Types.ObjectId,
    @Body() reqBody: ProjectUpdateDto,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    const { partners, advisors } = reqBody;
    classId = toMongoObjectId({ value: classId, key: 'classId' });
    projectId = toMongoObjectId({ value: projectId, key: 'projectId' });

    // find class has user
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

    // check permission
    const checkPermission = await this.projectHasUserService.findOne({
      userId,
      classId,
      projectId,
      role: { $in: [0, 1] },
      deletedAt: null,
    });
    if (checkPermission.statusCode !== 200)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    // find advisor
    const findAdvisor = await this.userHasRoleService.list({
      userId: { $in: advisors },
      deletedAt: null,
      role: 1,
    });
    if (findAdvisor.statusCode !== 200) {
      return response.status(findAdvisor.statusCode).send(findAdvisor);
    }
    if (findAdvisor.data.length !== advisors.length) {
      return response
        .status(404)
        .send({ statusCode: 404, message: 'Advisor Not Found' });
    }

    const res = await this.projectService.update(
      {
        ...reqBody,
        classId,
        userId,
      },
      projectId,
    );
    response.status(res.statusCode).send(res);
  }

  @Patch(`class/:classId/${defaultPath}/:projectId/accept`)
  async acceptProjectByAdvisor(
    @Param('classId') classId,
    @Param('projectId') projectId,
    @Body() body: ProjectAcceptDto,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    const { accept } = body;
    classId = toMongoObjectId({ value: classId, key: 'classId' });
    projectId = toMongoObjectId({ value: projectId, key: 'projectId' });

    // find project
    const findProject = await this.projectService.findOne({
      _id: projectId,
      classId,
      deletedAt: null,
    });
    if (findProject.statusCode !== 200)
      return response.status(findProject.statusCode).send(findProject);

    // find project has user
    const findProjectHasUser = await this.projectHasUserService.findOne({
      projectId,
      classId,
      role: 2,
      deletedAt: null,
      userId,
      isAccept: false,
    });
    if (findProjectHasUser.statusCode !== 200)
      return response
        .status(findProjectHasUser.statusCode)
        .send(findProjectHasUser);

    let res;
    if (accept) {
      res = await this.projectHasUserService.updateOne(
        {
          projectId,
          classId,
          role: 2,
          deletedAt: null,
          userId,
          isAccept: false,
        },
        { isAccept: true },
      );
    } else {
      res = await this.projectHasUserService.deleteOne({
        projectId,
        classId,
        role: 2,
        deletedAt: null,
        userId,
        isAccept: false,
      });
    }

    response.status(res.statusCode).send(res);
  }

  @Delete(`class/:classId/${defaultPath}/:projectId/leave`)
  async leaveProject(
    @Param('classId') classId: string | Types.ObjectId,
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
    projectId = toMongoObjectId({ value: projectId, key: 'projectId' });

    // check permission
    const findProjectHasUser = await this.projectHasUserService.findOne({
      classId,
      projectId,
      deletedAt: null,
      role: { $in: [0, 1] },
      userId,
    });

    if (findProjectHasUser.statusCode !== 200)
      return response
        .status(findProjectHasUser.statusCode)
        .send(findProjectHasUser);

    const res = await this.projectHasUserService.deleteOne({
      classId,
      projectId,
      deletedAt: null,
      role: { $in: [0, 1] },
      userId,
    });

    response.status(res.statusCode).send(res);
  }
}
