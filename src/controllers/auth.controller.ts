import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ProjectCreateDto } from 'src/dto/project.dto';
import { AuthService } from 'src/services/auth/auth.service';
import { ProjectCreateService } from 'src/services/project/project.create.service';

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
  async logout() {
    return await this.authService.signOutWihtGoogle();
  }
}
