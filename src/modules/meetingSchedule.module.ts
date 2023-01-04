import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MeetingScheduleController } from 'src/controllers/meetingschedule.controller';
import { MeetingScheduleSchema } from 'src/schema/meetingSchedule.schema';
import { MeetingScheduleService } from 'src/services/meetingSchedule.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'meeting_schedule', schema: MeetingScheduleSchema },
    ]),
  ],
  controllers: [MeetingScheduleController],
  providers: [MeetingScheduleService],
  exports: [MeetingScheduleService],
})
export class MeetingScheduleModule {}
