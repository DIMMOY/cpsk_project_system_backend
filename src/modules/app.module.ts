import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MG_URI } from 'src/config';
import { AuthModule } from './auth.module';
import { ClassModule } from './class.module';
import { DocumentModule } from './document.module';
import { ProjectModule } from './project.module';
import { UserModule } from './user.module';
import { MeetingScheduleModule } from './meetingSchedule.module';
import { AssessmentModule } from './assessment.module';
import { MatchCommitteeModule } from './matchCommittee.module';
@Module({
  imports: [
    MongooseModule.forRoot(MG_URI),
    ProjectModule,
    AuthModule,
    UserModule,
    ClassModule,
    DocumentModule,
    MeetingScheduleModule,
    AssessmentModule,
    MatchCommitteeModule,
  ],
})
export class AppModule {}
