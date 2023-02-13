import { Module } from '@nestjs/common';
import { AuthService } from 'src/services/auth.service';
@Module({
  imports: [],
  providers: [AuthService],
})
export class AuthModule {}
