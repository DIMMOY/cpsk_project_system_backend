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
import { UserHasProjectSchema } from 'src/schema/userHasProject.schema';
import { IsAdminMiddleware } from 'src/middleware/isAdmin.middleware';
import { IsStudentMiddleware } from 'src/middleware/isStudent.middleware';
import { UserService } from 'src/services/user.service';
import { UserSchema } from 'src/schema/user.schema';
import { UserHasRoleSchema } from 'src/schema/userHasRole.schema';
import { UserHasRoleService } from 'src/services/userHasRole.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'project', schema: ProjectSchema },
      { name: 'user_has_project', schema: UserHasProjectSchema },
      { name: 'user', schema: UserSchema },
      { name: 'user_has_role', schema: UserHasRoleSchema },
    ]),
  ],
  controllers: [ProjectController],
  providers: [ProjectService, UserService, UserHasRoleService],
  exports: [ProjectService],
})
export class ProjectModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(IsAdminMiddleware)
      .forRoutes({ path: 'class/:id/project', method: RequestMethod.GET });
    consumer
      .apply(IsStudentMiddleware)
      .forRoutes({ path: 'project', method: RequestMethod.POST });
  }
}
