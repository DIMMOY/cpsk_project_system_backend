import {
  Body,
  Controller,
  Post,
  Patch,
  Get,
  Req,
  Res,
  Query,
  Delete,
  Put,
} from '@nestjs/common';
import { request } from 'http';
import { CreateOrUpdateUserDto } from 'src/dto/user.dto';
import {
  ChangeCurrentRoleDto,
  CreateUserInRoleDto,
  DeleteUserInRoleDto,
  FindRoleDto,
} from 'src/dto/userHasRole.dto';
import { JoinClassDto } from 'src/dto/userJoinClass.dto';
import { ClassService } from 'src/services/class.service';
import { UserService } from 'src/services/user.service';
import { UserHasRoleService } from 'src/services/userHasRole.service';
import { UserJoinClassService } from 'src/services/userJoinClass.service';
@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userHasRoleService: UserHasRoleService,
    private readonly classService: ClassService,
    private readonly userJoinClassService: UserJoinClassService,
  ) {}

  @Get('/class')
  async findUserInClass(@Req() request, @Res() response) {
    const { _id: userId, email } = request.user;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    const res = await this.userJoinClassService.list({
      userId,
      deletedAt: null,
    });
    if (res.data.length > 1)
      return response
        .status(400)
        .send({ statusCode: 400, message: 'UserJoinClass Database Error' });

    response.status(res.statusCode).send({
      statusCode: res.statusCode,
      message: res.message,
      data: res.data.length ? res.data[0] : null,
    });
  }

  @Get('/role')
  async findUserInRole(
    @Query('n') role: number,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    if (!userId)
      return response
        .status(403)
        .send({ statusCode: 403, message: 'Permission Denied' });

    const res = await this.userHasRoleService.list({
      role,
      deletedAt: null,
    });
    response.status(res.statusCode).send(res);
  }

  @Post('/role')
  async addUserInRole(@Body() reqBody: CreateUserInRoleDto, @Res() response) {
    const { email, role } = reqBody;
    const emailParts = email.split('@');
    const domain = emailParts[1];
    if (domain !== 'ku.th') {
      response
        .status(400)
        .send({ statusCode: 400, message: 'อีเมล @ku.th เท่านั้น' });
      return;
    }

    let userId;
    const findEmail = await this.userService.findOne({
      email,
      deletedAt: null,
    });

    if (findEmail.statusCode !== 200) {
      const createUser = await this.userService.createOrUpdate({
        email,
        lastLoginAt: new Date(),
      });
      if (createUser.statusCode === 200) {
        userId = createUser.data.userId;
      } else {
        response.status(createUser.statusCode).send(createUser);
        return;
      }
    } else userId = findEmail.data._id;

    // delete student role if add advisor role
    if (role === 1)
      await this.userHasRoleService.delete({
        userId,
        role: 0,
        deletedAt: null,
      });

    const res = await this.userHasRoleService.createOrUpdate({ userId, role });

    response.status(res.statusCode).send(res);
  }

  @Post('/class/join')
  async joinClass(
    @Body() reqBody: JoinClassDto,
    @Req() request,
    @Res() response,
  ) {
    const { inviteCode } = reqBody;
    const { _id: userId } = request.user;

    // check class in database
    const classData = await this.classService.findOne({
      inviteCode,
      deletedAt: null,
    });
    if (classData.statusCode !== 200)
      return response.status(classData.statusCode).send(classData);
    const classId = classData.data._id;

    // check user not in other class
    const userJoinClassData = await this.userJoinClassService.list({
      userId,
      deletedAt: null,
    });
    if (userJoinClassData.statusCode !== 200)
      return response
        .status(userJoinClassData.statusCode)
        .send(userJoinClassData);
    if (userJoinClassData.data.length)
      return response
        .status(403)
        .send({ statusCode: 400, message: 'User Has Already In Class' });

    // join class
    const res = await this.userJoinClassService.create({ userId, classId });
    response.status(res.statusCode).send(res);
  }

  @Put('/role')
  async deleteUserInRole(
    @Body() reqBody: DeleteUserInRoleDto,
    @Res() response,
  ) {
    const { userId, role } = reqBody;
    const res = await this.userHasRoleService.delete({
      userId: { $in: userId },
      role,
      deletedAt: null,
    });
    response.status(res.statusCode).send(res);
  }

  @Patch('/current-role')
  async changeCurrentRole(
    @Body() reqBody: ChangeCurrentRoleDto,
    @Req() request,
    @Res() response,
  ) {
    const { _id: userId } = request.user;
    const { role } = reqBody;
    const res = await this.userHasRoleService.changeCurrentRole({
      userId,
      role,
    });
    response.status(res.statusCode).send(res);
  }

  @Patch('/last-login')
  async updateLastLoginAt(
    @Body() reqBody: CreateOrUpdateUserDto,
    @Req() request,
    @Res() response,
  ) {
    const { email } = request.user;
    const lastLoginAt = new Date();
    const res = await this.userService.createOrUpdate({
      email,
      lastLoginAt,
      ...reqBody,
    });
    response.status(res.statusCode).send(res);
  }
}
