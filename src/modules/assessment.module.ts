import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentController } from 'src/controllers/assessment.controller';
import { IsAdminMiddleware } from 'src/middleware/isAdmin.middleware';
import { IsAdminOrAdvisorMiddleware } from 'src/middleware/isAdminOrAdvisor.middleware';
import { AssessmentSchema } from 'src/schema/assessment.schema';
import { ClassHasAssessmentSchema } from 'src/schema/classHasAssessment.schema';
import { ProjectSchema } from 'src/schema/project.schema';
import { ProjectHasUserSchema } from 'src/schema/projectHasUser.schema';
import { UserSchema } from 'src/schema/user.schema';
import { UserHasRoleSchema } from 'src/schema/userHasRole.schema';
import { AssessmentService } from 'src/services/assessment.service';
import { ClassHasAssessmentService } from 'src/services/classHasAssessment.service';
import { ProjectService } from 'src/services/project.service';
import { ProjectHasUserService } from 'src/services/projectHasUser.service';
import { UserService } from 'src/services/user.service';
import { UserHasRoleService } from 'src/services/userHasRole.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'assessment', schema: AssessmentSchema },
      { name: 'user', schema: UserSchema },
      { name: 'user_has_role', schema: UserHasRoleSchema },
      { name: 'class_has_assessment', schema: ClassHasAssessmentSchema },
      { name: 'project_has_user', schema: ProjectHasUserSchema },
      { name: 'project', schema: ProjectSchema },
    ]),
  ],
  controllers: [AssessmentController],
  providers: [
    AssessmentService,
    UserService,
    UserHasRoleService,
    ProjectHasUserService,
    ClassHasAssessmentService,
    ProjectService,
  ],
  exports: [AssessmentService],
})
export class AssessmentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IsAdminMiddleware).forRoutes(
      { path: 'assessment', method: RequestMethod.POST },
      { path: 'assessment', method: RequestMethod.GET },
      { path: 'assessment/:id', method: RequestMethod.PUT },
      {
        path: 'class/:classId/assessment/:assessmentId/date',
        method: RequestMethod.PUT,
      },
      {
        path: 'class/:classId/assessment/:assessmentId/date/status',
        method: RequestMethod.PATCH,
      },
    );
    consumer.apply(IsAdminOrAdvisorMiddleware).forRoutes(
      {
        path: 'class/:classId/assessment',
        method: RequestMethod.GET,
      },
      {
        path: 'class/:classId/assessment/:assessmentId/project/:projectId',
        method: RequestMethod.GET,
      },
    );
  }
}
