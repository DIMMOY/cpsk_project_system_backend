import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Patch,
  Query,
  Res,
  Req,
} from '@nestjs/common';
import { request } from 'http';
import { Types } from 'mongoose';
import {
  MatchCommitteeCreateDto,
  MatchCommitteeSetDateDto,
  MatchCommitteeSetStatusDto,
} from 'src/dto/matchCommittee.dto';
import {
  MatchCommitteeHasGroupCreateDto,
  MatchCommitteeHasGroupCreateWithProjectDto,
} from 'src/dto/matchCommitteeHasGroup.dto';
import { ClassService } from 'src/services/class.service';
import { MatchCommitteeService } from 'src/services/matchCommittee.service';
import { MatchCommitteeHasGroupService } from 'src/services/matchCommitteeHasGroup.service';
import { ProjectService } from 'src/services/project.service';
import { ProjectHasUserService } from 'src/services/projectHasUser.service';
import { UserService } from 'src/services/user.service';
import { UserHasRoleService } from 'src/services/userHasRole.service';
import { toMongoObjectId } from 'src/utils/mongoDB.utils';

const defaultPath = 'committee';

@Controller('')
export class MatchCommitteeController {
  constructor(
    private readonly classService: ClassService,
    private readonly matchCommitteeService: MatchCommitteeService,
    private readonly matchCommitteHasGroupService: MatchCommitteeHasGroupService,
    private readonly userService: UserService,
    private readonly userHasRoleService: UserHasRoleService,
    private readonly projectService: ProjectService,
    private readonly projectHasUserService: ProjectHasUserService,
  ) {}

  @Post(`/class/:classId/${defaultPath}`)
  async createMatchCommitteeInClass(
    @Param('classId') classId: string,
    @Body() body: MatchCommitteeCreateDto,
    @Res() response,
  ) {
    // check class
    const findClass = await this.classService.findOne({
      _id: toMongoObjectId({ value: classId, key: 'classId' }),
      deletedAt: null,
    });
    if (findClass.statusCode !== 200)
      return response.status(findClass.statusCode).send(findClass);

    const { name } = body;
    const res = await this.matchCommitteeService.create({
      classId: toMongoObjectId({ value: classId, key: 'classId' }),
      name,
    });
    response.status(res.statusCode).send(res);
  }

  @Post(`/class/:classId/${defaultPath}/:committeeId/group`)
  async createGroupMatchCommitteeInClass(
    @Param('committeeId') committeeId: string,
    @Param('classId') classId: string,
    @Body() body: MatchCommitteeHasGroupCreateDto,
    @Res() response,
  ) {
    // check class
    const findClass = await this.classService.findOne({
      _id: toMongoObjectId({ value: classId, key: 'classId' }),
      deletedAt: null,
    });
    if (findClass.statusCode !== 200)
      return response.status(findClass.statusCode).send(findClass);

    // check committee
    const findMatchCommittee = await this.matchCommitteeService.findOne({
      _id: toMongoObjectId({ value: committeeId, key: 'committeeId' }),
      classId: toMongoObjectId({ value: classId, key: 'classId' }),
      deletedAt: null,
    });
    if (findMatchCommittee.statusCode !== 200)
      return response
        .status(findMatchCommittee.statusCode)
        .send(findMatchCommittee);

    // check userId and role
    const { userId } = body;
    const findUser = await this.userHasRoleService.list({
      userId: { $in: userId },
      role: 1,
      deletedAt: null,
    });
    if (findUser.statusCode !== 200)
      return response.status(findUser.statusCode).send(findUser);
    else if (findUser.data.length !== userId.length)
      return response
        .status(404)
        .send({ statusCode: 404, message: 'Advisors Not Found' });

    // check userId has alreay in group
    const findUserInGroup = await this.matchCommitteHasGroupService.list(null, {
      userId: { $in: userId },
      deletedAt: null,
      matchCommitteeId: toMongoObjectId({
        value: committeeId,
        key: 'committeeId',
      }),
    });
    if (findUserInGroup.statusCode !== 200)
      return response.status(findUserInGroup.statusCode).send(findUserInGroup);
    else if (findUserInGroup.data.length)
      return response
        .status(404)
        .send({ statusCode: 404, message: 'Advisors Have Already In Group' });

    // create new
    const res = await this.matchCommitteHasGroupService.createOrUpdate({
      matchCommitteeId: toMongoObjectId({
        value: committeeId,
        key: 'committeeId',
      }),
      userId,
    });
    response.status(res.statusCode).send(res);
  }

  @Post(`/class/:classId/${defaultPath}/:committeeId/group/:groupId`)
  async createMatchCommitteeToProject(
    @Param('classId') classId: string,
    @Param('committeeId') committeeId: string,
    @Param('groupId') groupId: string,
    @Body() body: MatchCommitteeHasGroupCreateWithProjectDto,
    @Res() response,
  ) {
    const mClassId = toMongoObjectId({ value: classId, key: 'classId' });
    const mCommitteeId = toMongoObjectId({
      value: committeeId,
      key: 'committeeId',
    });
    const mGroupId = toMongoObjectId({ value: groupId, key: 'groupId' });

    // check class
    const findClass = await this.classService.findOne({
      _id: mClassId,
      deletedAt: null,
    });
    if (findClass.statusCode !== 200)
      return response.status(findClass.statusCode).send(findClass);

    // check committee
    const findMatchCommittee = await this.matchCommitteeService.findOne({
      _id: mCommitteeId,
      classId: mClassId,
      deletedAt: null,
    });
    if (findMatchCommittee.statusCode !== 200)
      return response
        .status(findMatchCommittee.statusCode)
        .send(findMatchCommittee);

    // check committee has group
    const findMatchCommitteeHasGroup =
      await this.matchCommitteHasGroupService.findOne({
        _id: mGroupId,
        matchCommitteeId: mCommitteeId,
        deletedAt: null,
      });
    if (findMatchCommitteeHasGroup.statusCode !== 200)
      return response
        .status(findMatchCommitteeHasGroup.statusCode)
        .send(findMatchCommitteeHasGroup);

    const { createInGroup, deleteInGroup } = body;
    // check project
    const findProject = await this.projectService.list(null, {
      _id: { $in: [...createInGroup, ...deleteInGroup] },
      classId: mClassId,
      deletedAt: null,
    });
    if (findProject.statusCode !== 200)
      return response.status(findProject.statusCode).send(findProject);
    if (findProject.data.length !== [...createInGroup, ...deleteInGroup].length)
      return response
        .status(404)
        .send({ statusCode: 404, message: 'Project Not Found' });

    // delete project in group
    if (deleteInGroup.length) {
      const deleteProjectInGroup = await this.projectHasUserService.deleteMany({
        projectId: { $in: deleteInGroup },
        deletedAt: null,
        role: 3,
        matchCommitteeId: mCommitteeId,
      });
      if (deleteProjectInGroup.statusCode !== 200)
        return response
          .status(deleteProjectInGroup.statusCode)
          .send(deleteProjectInGroup);
    }

    if (createInGroup.length) {
      // delete old committee
      const deleteOldCommittee = await this.projectHasUserService.deleteMany({
        projectId: { $in: createInGroup },
        deletedAt: null,
        role: 3,
        matchCommitteeId: mCommitteeId,
      });
      if (deleteOldCommittee.statusCode !== 200)
        return response
          .status(deleteOldCommittee.statusCode)
          .send(deleteOldCommittee);

      // add new committee
      const userCommittee = findMatchCommitteeHasGroup.data.userId;
      const addNewCommittee = await this.projectHasUserService.insertMany(
        createInGroup.flatMap((id) =>
          userCommittee.map((user) => ({
            projectId: id,
            role: 3,
            classId: mClassId,
            matchCommitteeId: mCommitteeId,
            matchCommitteeHasGroupId: mGroupId,
            userId: user,
            isAccept: true,
          })),
        ),
      );
      if (addNewCommittee.statusCode !== 201)
        return response
          .status(addNewCommittee.statusCode)
          .send(addNewCommittee);
    }
    response
      .status(201)
      .send({ statusCode: 201, message: 'Create ProjectHasUser Successful' });
  }

  @Get(`/class/:classId/${defaultPath}/:committeeId/group`)
  async listGroupMatchCommitteeInClass(
    @Param('classId') classId: string,
    @Param('committeeId') committeeId: string,
    @Query('sort') sort: string,
    @Res() response,
  ) {
    const res = await this.matchCommitteeService.list(sort, {
      classId: toMongoObjectId({ value: classId, key: 'classId' }),
      deletedAt: null,
    });
    response.status(res.statusCode).send(res);
  }

  @Get(`/class/:classId/${defaultPath}`)
  async listeMatchCommitteeInClass(
    @Param('classId') classId: string,
    @Query('sort') sort: string,
    @Req() request,
    @Res() response,
  ) {
    const { role, currentRole } = request;

    // if not admin or current role is advisor
    let res;
    if (!role.find((e) => e === 2) || currentRole === 1) {
      res = await this.matchCommitteeService.list(sort, {
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        deletedAt: null,
        status: true,
      });
    } else {
      res = await this.matchCommitteeService.list(sort, {
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        deletedAt: null,
      });
    }
    response.status(res.statusCode).send(res);
  }

  @Get(`/class/:classId/${defaultPath}/:committeeId`)
  async getMatchCommitteeInClass(
    @Param('classId') classId: string,
    @Param('committeeId') committeeId: string,
    @Res() response,
  ) {
    const committeeData = await this.matchCommitteeService.findOne({
      _id: toMongoObjectId({
        value: committeeId,
        key: 'committeeId',
      }),
      classId: toMongoObjectId({ value: classId, key: 'classId' }),
      deletedAt: null,
    });
    if (committeeData.statusCode !== 200)
      return response.status(committeeData.statusCode).send(committeeData);

    const committeeGroupData = await this.matchCommitteHasGroupService.list(
      'createdAtASC',
      {
        matchCommitteeId: toMongoObjectId({
          value: committeeId,
          key: 'committeeId',
        }),
        deletedAt: null,
      },
    );
    if (committeeGroupData.statusCode !== 200)
      return response
        .status(committeeGroupData.statusCode)
        .send(committeeGroupData);

    const res = {
      statusCode: committeeData.statusCode,
      message: committeeData.message,
      data: {
        ...committeeData.data._doc,
        committeeGroup: committeeGroupData.data,
      },
    };
    response.status(res.statusCode).send(res);
  }

  @Put(`class/:classId/${defaultPath}/:committeeId/date`)
  async setDateMeetingScheduleInClass(
    @Param('classId') classId: string,
    @Param('committeeId') committeeId: string,
    @Body() body: MatchCommitteeSetDateDto,
    @Res() response,
  ) {
    const res = await this.matchCommitteeService.update(
      {
        _id: toMongoObjectId({ value: committeeId, key: 'committeeId' }),
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        deletedAt: null,
      },
      {
        ...body,
        status: true,
      },
    );

    await this.projectHasUserService.updateMany(
      {
        matchCommitteeId: toMongoObjectId({
          value: committeeId,
          key: 'committeeId',
        }),
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        deletedAt: null,
      },
      body,
    );
    response.status(res.statusCode).send(res);
  }

  @Patch(`project/:projectId/${defaultPath}/:committeeId/date`)
  async changeStartDateOfMatchCommitteeInProject(
    @Param('projectId') projectId: string,
    @Param('committeeId') committeeId: string,
    @Body() body: MatchCommitteeSetDateDto,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;

    const findData = await this.projectHasUserService.findOne({
      matchCommitteeId: toMongoObjectId({
        value: committeeId,
        key: 'committeeId',
      }),
      userId,
      projectId: toMongoObjectId({ value: projectId, key: 'projectId' }),
      deletedAt: null,
      role: 3,
      isAccept: true,
    });

    if (findData.statusCode !== 200)
      return response.status(findData.statusCode).send(findData);

    const { matchCommitteeHasGroupId } = findData.data;

    const res = await this.projectHasUserService.updateMany(
      {
        matchCommitteeId: toMongoObjectId({
          value: committeeId,
          key: 'committeeId',
        }),
        matchCommitteeHasGroupId,
        projectId: toMongoObjectId({ value: projectId, key: 'projectId' }),
        deletedAt: null,
        role: 3,
        isAccept: true,
      },
      body,
    );
    response.status(res.statusCode).send(res);
  }

  @Patch(`class/:classId/${defaultPath}/:committeeId/date/status`)
  async changeMatchCommitteeInClass(
    @Param('classId') classId: string,
    @Param('committeeId') committeeId: string,
    @Body() body: MatchCommitteeSetStatusDto,
    @Res() response,
  ) {
    const res = await this.matchCommitteeService.update(
      {
        _id: toMongoObjectId({ value: committeeId, key: 'committeeId' }),
        classId: toMongoObjectId({ value: classId, key: 'classId' }),
        deletedAt: null,
      },
      {
        ...body,
        startDate: null,
      },
    );
    response.status(res.statusCode).send(res);
  }

  @Delete(`/class/:classId/${defaultPath}/:committeeId/group/:groupId`)
  async deleteGroupMatchCommitteeInClass(
    @Param('committeeId') committeeId: string | Types.ObjectId,
    @Param('classId') classId: string | Types.ObjectId,
    @Param('groupId') groupId: string | Types.ObjectId,
    @Res() response,
  ) {
    classId = toMongoObjectId({ value: classId, key: 'classId' });
    committeeId = toMongoObjectId({ value: committeeId, key: 'committeeId' });
    groupId = toMongoObjectId({ value: groupId, key: 'groupId' });

    // check class
    const findClass = await this.classService.findOne({
      _id: classId,
      deletedAt: null,
    });
    if (findClass.statusCode !== 200)
      return response.status(findClass.statusCode).send(findClass);

    // check committee
    const findMatchCommittee = await this.matchCommitteeService.findOne({
      _id: committeeId,
      classId,
      deletedAt: null,
    });
    if (findMatchCommittee.statusCode !== 200)
      return response
        .status(findMatchCommittee.statusCode)
        .send(findMatchCommittee);

    const deleteGroup = await this.matchCommitteHasGroupService.deleteMany({
      _id: groupId,
      matchCommitteeId: committeeId,
      deletedAt: null,
    });
    if (deleteGroup.statusCode !== 200)
      return response.status(deleteGroup.statusCode).send(deleteGroup);

    const deletePermission = await this.projectHasUserService.deleteMany({
      matchCommitteeId: committeeId,
      matchCommitteeHasGroupId: groupId,
      role: 3,
      deletedAt: null,
    });
    response.status(deleteGroup.statusCode).send(deleteGroup);
  }
}
