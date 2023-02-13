import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserController } from 'src/controllers/user.controller';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
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
      { name: 'user', schema: UserSchema },
      { name: 'user_has_role', schema: UserHasRoleSchema },
      { name: 'class', schema: ClassSchema },
      { name: 'user_join_class', schema: UserJoinClassSchema },
    ]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    UserHasRoleService,
    ClassService,
    UserJoinClassService,
  ],
  exports: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IsStudentMiddleware)
      .forRoutes(
        { path: 'user/class/join', method: RequestMethod.POST },
        { path: 'user/class', method: RequestMethod.GET },
      );
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'user/last-login', method: RequestMethod.PATCH },
        { path: 'user/current-role', method: RequestMethod.PATCH },
      );
  }
}
