import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectController } from 'src/controllers/project.controller';
import { ProjectSchema } from 'src/schema/project.schema';
import { ProjectCreateService } from 'src/services/project.service';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'project', schema: ProjectSchema }]),
  ],
  controllers: [ProjectController],
  providers: [ProjectCreateService],
  exports: [ProjectCreateService],
})
export class ProjectModule {}
