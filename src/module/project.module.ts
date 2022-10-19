import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectController } from 'src/controller/project.controller';
import { ProjectSchema } from 'src/schema/project.schema';
import { ProjectCreateService } from 'src/service/project/project.create.service';
import { AppController } from '../controller/app.controller';
import { AppService } from '../service/app.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'project', schema: ProjectSchema }]),
  ],
  controllers: [ProjectController],
  providers: [ProjectCreateService],
  exports: [ProjectCreateService],
})
export class ProjectModule {}
