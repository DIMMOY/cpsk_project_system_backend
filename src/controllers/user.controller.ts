import { Body, Controller, Post, Patch, Get, Req, Res } from '@nestjs/common';
import { ChangeCurrentRoleDto } from 'src/dto/userHasRole.dto';
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
  async updateLastLoginAt(@Req() request, @Res() response) {
    const { email } = request.user;
    const lastLoginAt = new Date();
    const res = await this.userService.createOrUpdate({ email, lastLoginAt });
    response.status(res.statusCode).send(res);
  }
}
