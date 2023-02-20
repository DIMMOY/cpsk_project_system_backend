import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingScheduleController } from 'src/controllers/meetingschedule.controller';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { IsAdminMiddleware } from 'src/middleware/isAdmin.middleware';
import { IsAdvisorMiddleware } from 'src/middleware/isAdvisor.middleware';
import { IsStudentMiddleware } from 'src/middleware/isStudent.middleware';
import { ClassHasMeetingScheduleSchema } from 'src/schema/classHasMeetingSchedule.schema';
import { MeetingScheduleSchema } from 'src/schema/meetingSchedule.schema';
import { ProjectSchema } from 'src/schema/project.schema';
import { ProjectSendMeetingScheduleSchema } from 'src/schema/projectSendMeetingSchedule.schema';
import { UserSchema } from 'src/schema/user.schema';
import { UserHasRoleSchema } from 'src/schema/userHasRole.schema';
import { ClassHasMeetingScheduleService } from 'src/services/classHasMeetingSchedule.service';
import { MeetingScheduleService } from 'src/services/meetingSchedule.service';
import { ProjectSendMeetingScheduleService } from 'src/services/projectSendMeetingSchedule.service';
import { UserService } from 'src/services/user.service';
import { UserHasRoleService } from 'src/services/userHasRole.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'meeting_schedule', schema: MeetingScheduleSchema },
      {
        name: 'class_has_meeting_schedule',
        schema: ClassHasMeetingScheduleSchema,
      },
      {
        name: 'project_send_meeting_schedule',
        schema: ProjectSendMeetingScheduleSchema,
      },
      { name: 'project', schema: ProjectSchema },
      { name: 'user', schema: UserSchema },
      { name: 'user_has_role', schema: UserHasRoleSchema },
    ]),
  ],
  controllers: [MeetingScheduleController],
  providers: [
    MeetingScheduleService,
    ClassHasMeetingScheduleService,
    ProjectSendMeetingScheduleService,
    UserService,
    UserHasRoleService,
  ],
  exports: [
    MeetingScheduleService,
    ClassHasMeetingScheduleService,
    ProjectSendMeetingScheduleService,
  ],
})
export class MeetingScheduleModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IsAdminMiddleware).forRoutes(
      { path: 'meeting-schedule', method: RequestMethod.POST },
      { path: 'meeting-schedule', method: RequestMethod.GET },
      { path: 'class/:classId/meeting-schedule', method: RequestMethod.GET },
      { path: 'meeting-schedule/:mtId', method: RequestMethod.PUT },
      {
        path: 'class/:classId/meeting-schedule/:mtId/date',
        method: RequestMethod.PUT,
      },
      {
        path: 'class/:classId/meeting-schedule/:mtId/date/status',
        method: RequestMethod.PATCH,
      },
      { path: 'meeting-schedule', method: RequestMethod.DELETE },
    );
    consumer.apply(IsAdvisorMiddleware).forRoutes({
      path: 'project/:projectId/meeting-schedule/:mtId',
      method: RequestMethod.PATCH,
    });
    consumer.apply(IsStudentMiddleware).forRoutes(
      {
        path: 'project/:projectId/meeting-schedule/:mtId',
        method: RequestMethod.POST,
      },
      {
        path: 'project/:projectId/meeting-schedule/:mtId',
        method: RequestMethod.DELETE,
      },
    );
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'class/:classId/project/:projectId/meeting-schedule/:mtId/detail',
        method: RequestMethod.GET,
      },
      {
        path: 'class/:classId/project/:projectId/meeting-schedule',
        method: RequestMethod.GET,
      },
    );
  }
}
