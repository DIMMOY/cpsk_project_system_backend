import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectController } from 'src/controllers/project.controller';
import { ProjectSchema } from 'src/schema/project.schema';
import { ProjectService } from 'src/services/project.service';
import { AppController } from '../controllers/app.controller';
import { AppService } from '../services/app.service';
import { UserHasProjectSchema } from 'src/schema/userHasProject.schema';
import { ClassHasDocumentService } from 'src/services/classHasDocument.service';
import { ClassHasDocumentSchema } from 'src/schema/classHasDocument.schema';
import { ProjectSendDocumentSchema } from 'src/schema/projectSendDocument.schema';
import { ProjectSendDocumentService } from 'src/services/projectSendDocument.service';
import { ProjectSendMeetingScheduleSchema } from 'src/schema/projectSendMeetingSchedule.schema';
import { ClassHasMeetingScheduleService } from 'src/services/classHasMeetingSchedule.service';
import { ProjectSendMeetingScheduleService } from 'src/services/projectSendMeetingSchedule.service';
import { ClassHasMeetingScheduleSchema } from 'src/schema/classHasMeetingSchedule.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'project', schema: ProjectSchema },
      { name: 'user_has_project', schema: UserHasProjectSchema },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
  exports: [ProjectService],
})
export class ProjectModule {}
