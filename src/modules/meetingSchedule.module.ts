import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingScheduleController } from 'src/controllers/meetingschedule.controller';
import { ClassHasMeetingScheduleSchema } from 'src/schema/classHasMeetingSchedule.schema';
import { MeetingScheduleSchema } from 'src/schema/meetingSchedule.schema';
import { ClassHasMeetingScheduleService } from 'src/services/classHasMeetingSchedule.service';
import { MeetingScheduleService } from 'src/services/meetingSchedule.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'meeting_schedule', schema: MeetingScheduleSchema },
      {
        name: 'class_has_meeting_schedule',
        schema: ClassHasMeetingScheduleSchema,
      },
    ]),
  ],
  controllers: [MeetingScheduleController],
  providers: [MeetingScheduleService, ClassHasMeetingScheduleService],
  exports: [MeetingScheduleService, ClassHasMeetingScheduleService],
})
export class MeetingScheduleModule {}
