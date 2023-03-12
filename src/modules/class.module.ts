import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClassController } from 'src/controllers/class.controller';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { IsAdminMiddleware } from 'src/middleware/isAdmin.middleware';
import { IsAdminOrAdvisorMiddleware } from 'src/middleware/isAdminOrAdvisor.middleware';
import { IsStudentMiddleware } from 'src/middleware/isStudent.middleware';
import { ClassSchema } from 'src/schema/class.schema';
import { UserSchema } from 'src/schema/user.schema';
import { UserHasRoleSchema } from 'src/schema/userHasRole.schema';
import { UserJoinClassSchema } from 'src/schema/userJoinClass.schema';
import { ClassService } from 'src/services/class.service';
import { UserService } from 'src/services/user.service';
import { UserHasRoleService } from 'src/services/userHasRole.service';
import { UserJoinClassService } from 'src/services/userJoinClass.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'class', schema: ClassSchema },
      { name: 'user', schema: UserSchema },
      { name: 'user_has_role', schema: UserHasRoleSchema },
      { name: 'user_join_class', schema: UserJoinClassSchema },
    ]),
  ],
  controllers: [ClassController],
  providers: [
    ClassService,
    UserService,
    UserHasRoleService,
    UserJoinClassService,
  ],
  exports: [ClassService],
})
export class ClassModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IsAdminOrAdvisorMiddleware)
      .forRoutes({ path: 'class', method: RequestMethod.GET });
    consumer
      .apply(IsAdminMiddleware)
      .forRoutes(
        { path: 'class', method: RequestMethod.POST },
        { path: 'class/:classId', method: RequestMethod.PUT },
      );
    consumer.apply(IsStudentMiddleware).forRoutes({
      path: 'class/:classId/leave',
      method: RequestMethod.DELETE,
    });
    consumer.apply(AuthMiddleware).forRoutes({
      path: 'class/:classId',
      method: RequestMethod.GET,
    });
  }
}
