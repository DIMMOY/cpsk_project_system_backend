import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MG_URI } from 'src/config';
import { AppController } from '../controller/app.controller';
import { AppService } from '../service/app.service';
import { AuthModule } from './auth.module';
import { ProjectModule } from './project.module';
import { UserModule } from './user.module';
@Module({
  imports: [
    MongooseModule.forRoot(MG_URI),
    ProjectModule,
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
