import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AssessmentController } from 'src/controllers/assessment.controller';
import { IsAdminMiddleware } from 'src/middleware/isAdmin.middleware';
import { AssessmentSchema } from 'src/schema/assessment.schema';
import { UserSchema } from 'src/schema/user.schema';
import { UserHasRoleSchema } from 'src/schema/userHasRole.schema';
import { AssessmentService } from 'src/services/assessment.service';
import { UserService } from 'src/services/user.service';
import { UserHasRoleService } from 'src/services/userHasRole.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'assessment', schema: AssessmentSchema },
      { name: 'user', schema: UserSchema },
      { name: 'user_has_role', schema: UserHasRoleSchema },
    ]),
  ],
  controllers: [AssessmentController],
  providers: [AssessmentService, UserService, UserHasRoleService],
  exports: [AssessmentService],
})
export class AssessmentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IsAdminMiddleware)
      .forRoutes(
        { path: 'assessment', method: RequestMethod.POST },
        { path: 'assessment', method: RequestMethod.GET },
        { path: 'assessment/:id', method: RequestMethod.PUT },
      );
  }
}
