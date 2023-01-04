import { Body, Controller, HttpCode, Post, Patch } from '@nestjs/common';
import { ProjectCreateDto } from 'src/dto/project.dto';
import { CreateOrUpdateUserDto } from 'src/dto/user.dto';
import { ChangeCurrentRoleDto } from 'src/dto/userHasRole.dto';
import { UserService } from 'src/services/user.service';
import { UserHasRoleService } from 'src/services/userHasRole.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly userHasRoleService: UserHasRoleService,
  ) {}

  @Post()
  @HttpCode(201)
  async createProject(@Body() reqBody: CreateOrUpdateUserDto) {
    return await this.userService.createOrUpdateUser(reqBody);
  }

  @Patch('/current-role')
  @HttpCode(200)
  async changeCurrentRole(@Body() reqBody: ChangeCurrentRoleDto) {
    return await this.userHasRoleService.changeCurrentRole(reqBody);
  }
}
