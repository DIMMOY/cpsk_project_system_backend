import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingScheduleController } from 'src/controllers/meetingschedule.controller';
import { ClassHasMeetingScheduleSchema } from 'src/schema/classHasMeetingSchedule.schema';
import { MeetingScheduleSchema } from 'src/schema/meetingSchedule.schema';
import { ProjectSchema } from 'src/schema/project.schema';
import { ProjectSendMeetingScheduleSchema } from 'src/schema/projectSendMeetingSchedule.schema';
import { ClassHasMeetingScheduleService } from 'src/services/classHasMeetingSchedule.service';
import { MeetingScheduleService } from 'src/services/meetingSchedule.service';
import { ProjectService } from 'src/services/project.service';
import { ProjectSendMeetingScheduleService } from 'src/services/projectSendMeetingSchedule.service';

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
      {
        name: 'project',
        schema: ProjectSchema,
      },
    ]),
  ],
  controllers: [MeetingScheduleController],
  providers: [
    MeetingScheduleService,
    ClassHasMeetingScheduleService,
    ProjectSendMeetingScheduleService,
  ],
  exports: [
    MeetingScheduleService,
    ClassHasMeetingScheduleService,
    ProjectSendMeetingScheduleService,
  ],
})
export class MeetingScheduleModule {}
