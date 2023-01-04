import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectController } from 'src/controllers/project.controller';
import { ProjectSchema } from 'src/schema/project.schema';
import { ProjectCreateService } from 'src/services/project.service';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { UserHasProjectSchema } from 'src/schema/userHasProject.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'project', schema: ProjectSchema },
      { name: 'user_has_project', schema: UserHasProjectSchema },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectCreateService],
  exports: [ProjectCreateService],
})
export class ProjectModule {}
