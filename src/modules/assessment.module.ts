import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentController } from 'src/controllers/assessment.controller';
import { AssessmentSchema } from 'src/schema/assessment.schema';
import { AssessmentService } from 'src/services/assessment.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'assessment', schema: AssessmentSchema },
    ]),
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService],
  exports: [AssessmentService],
})
export class AssessmentModule {}
