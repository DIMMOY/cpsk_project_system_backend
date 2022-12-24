import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MG_URI } from 'src/config';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { AuthModule } from './auth.module';
import { ClassModule } from './class.module';
import { DocumentModule } from './document.module';
import { ProjectModule } from './project.module';
import { UserModule } from './user.module';
@Module({
  imports: [
    MongooseModule.forRoot(MG_URI),
    ProjectModule,
    AuthModule,
    UserModule,
    ClassModule,
    DocumentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
