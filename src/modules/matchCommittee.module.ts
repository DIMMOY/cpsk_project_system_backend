import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { IsAdminMiddleware } from 'src/middleware/isAdmin.middleware';
import { MatchCommitteeSchema } from 'src/schema/matchCommittee.schema';
import { MatchCommitteeController } from 'src/controllers/matchCommittee.controller';
import { MatchCommitteeService } from 'src/services/matchCommittee.service';
import { ProjectHasUserSchema } from 'src/schema/projectHasUser.schema';
import { ProjectHasUserService } from 'src/services/projectHasUser.service';
import { UserHasRoleService } from 'src/services/userHasRole.service';
import { UserHasRoleSchema } from 'src/schema/userHasRole.schema';
import { UserSchema } from 'src/schema/user.schema';
import { UserService } from 'src/services/user.service';
import { MatchCommitteeHasGroupService } from 'src/services/matchCommitteeHasGroup.service';
import { MatchCommitteeHasGroupSchema } from 'src/schema/matchCommitteeHasGroup.schema';
import { ClassSchema } from 'src/schema/class.schema';
import { ClassService } from 'src/services/class.service';
import { ProjectSchema } from 'src/schema/project.schema';
import { ProjectService } from 'src/services/project.service';
import { IsAdminOrAdvisorMiddleware } from 'src/middleware/isAdminOrAdvisor.middleware';
import { IsAdvisorMiddleware } from 'src/middleware/isAdvisor.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'match_committee', schema: MatchCommitteeSchema },
      {
        name: 'match_committee_has_group',
        schema: MatchCommitteeHasGroupSchema,
      },
      { name: 'user', schema: UserSchema },
      { name: 'project_has_user', schema: ProjectHasUserSchema },
      { name: 'user_has_role', schema: UserHasRoleSchema },
      { name: 'class', schema: ClassSchema },
      { name: 'project', schema: ProjectSchema },
    ]),
  ],
  controllers: [MatchCommitteeController],
  providers: [
    MatchCommitteeService,
    MatchCommitteeHasGroupService,
    ProjectHasUserService,
    UserHasRoleService,
    UserService,
    ClassService,
    ProjectService,
  ],
  exports: [MatchCommitteeService],
})
export class MatchCommitteeModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IsAdminMiddleware).forRoutes(
      {
        path: 'class/:classId/committee',
        method: RequestMethod.POST,
      },
      {
        path: 'class/:classId/committee/:committeeId/group',
        method: RequestMethod.POST,
      },
      {
        path: 'class/:classId/committee/:committeeId/group/:groupId',
        method: RequestMethod.POST,
      },
      {
        path: 'class/:classId/committee/:committeeId/date',
        method: RequestMethod.PUT,
      },
      {
        path: 'class/:classId/committee/:committeeId/date/status',
        method: RequestMethod.PATCH,
      },
      {
        path: 'class/:classId/committee/:committeeId/group/:groupId',
        method: RequestMethod.DELETE,
      },
    );
    consumer.apply(IsAdminOrAdvisorMiddleware).forRoutes(
      {
        path: 'class/:classId/committee/:committeeId/group',
        method: RequestMethod.GET,
      },
      {
        path: 'class/:classId/committee',
        method: RequestMethod.GET,
      },
    );
    consumer.apply(IsAdvisorMiddleware).forRoutes({
      path: 'project/:projectId/committee/:committeeId/date',
      method: RequestMethod.PATCH,
    });
  }
}
