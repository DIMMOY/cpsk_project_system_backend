import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ProjectCreateDto } from 'src/dto/project.dto';
import { CreateOrUpdateUserDto } from 'src/dto/user.dto';
import { UserService } from 'src/service/user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @HttpCode(201)
  async createProject(@Body() createOrUpdateUserDto: CreateOrUpdateUserDto) {
    return await this.userService.createOrUpdateUser(createOrUpdateUserDto);
  }
}
