import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectController } from 'src/controllers/project.controller';
import { ProjectSchema } from 'src/schema/project.schema';
import { ProjectService } from 'src/services/project.service';
import { ProjectHasUserSchema } from 'src/schema/projectHasUser.schema';
import { IsAdminMiddleware } from 'src/middleware/isAdmin.middleware';
import { IsStudentMiddleware } from 'src/middleware/isStudent.middleware';
import { UserService } from 'src/services/user.service';
import { UserSchema } from 'src/schema/user.schema';
import { UserHasRoleSchema } from 'src/schema/userHasRole.schema';
import { UserHasRoleService } from 'src/services/userHasRole.service';
import { ClassSchema } from 'src/schema/class.schema';
import { ClassService } from 'src/services/class.service';
import { ProjectHasUserService } from 'src/services/projectHasUser.service';
import { UserJoinClassSchema } from 'src/schema/userJoinClass.schema';
import { UserJoinClassService } from 'src/services/userJoinClass.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'project', schema: ProjectSchema },
      { name: 'project_has_user', schema: ProjectHasUserSchema },
      { name: 'user', schema: UserSchema },
      { name: 'user_has_role', schema: UserHasRoleSchema },
      { name: 'user_join_class', schema: UserJoinClassSchema },
      { name: 'class', schema: ClassSchema },
    ]),
  ],
  controllers: [ProjectController],
  providers: [
    ProjectService,
    UserService,
    UserHasRoleService,
    UserJoinClassService,
    ClassService,
    ProjectHasUserService,
  ],
  exports: [ProjectService],
})
export class ProjectModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IsAdminMiddleware)
      .forRoutes({ path: 'class/:id/project', method: RequestMethod.GET });
    consumer
      .apply(IsStudentMiddleware)
      .forRoutes({ path: 'class/:id/project', method: RequestMethod.POST });
  }
}
