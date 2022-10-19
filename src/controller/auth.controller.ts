import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ProjectCreateDto } from 'src/dto/project.dto';
import { AuthService } from 'src/service/auth/auth.service';
import { ProjectCreateService } from 'src/service/project/project.create.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('google/login')
  @HttpCode(200)
  async login() {
    return await this.authService.signInWithGoogle();
  }

  @Post('google/logout')
  @HttpCode(200)
  async createProject() {
    return await this.authService.signOutWihtGoogle();
  }
}
