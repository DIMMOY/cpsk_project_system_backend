import {
  Module,
  NestModule,
  MiddlewareConsumer,
  RequestMethod,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentController } from 'src/controllers/document.controller';
import { AuthMiddleware } from 'src/middleware/auth.middleware';
import { IsAdminMiddleware } from 'src/middleware/isAdmin.middleware';
import { IsAdminOrAdvisorMiddleware } from 'src/middleware/isAdminOrAdvisor.middleware';
import { IsStudentMiddleware } from 'src/middleware/isStudent.middleware';
import { ClassHasDocumentSchema } from 'src/schema/classHasDocument.schema';
import { DocumentSchema } from 'src/schema/document.schema';
import { ProjectSchema } from 'src/schema/project.schema';
import { ProjectHasUserSchema } from 'src/schema/projectHasUser.schema';
import { ProjectSendDocumentSchema } from 'src/schema/projectSendDocument.schema';
import { UserSchema } from 'src/schema/user.schema';
import { UserHasRoleSchema } from 'src/schema/userHasRole.schema';
import { ClassHasDocumentService } from 'src/services/classHasDocument.service';
import { DocumentService } from 'src/services/document.service';
import { ProjectService } from 'src/services/project.service';
import { ProjectHasUserService } from 'src/services/projectHasUser.service';
import { ProjectSendDocumentService } from 'src/services/projectSendDocument.service';
import { UserService } from 'src/services/user.service';
import { UserHasRoleService } from 'src/services/userHasRole.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'document', schema: DocumentSchema },
      { name: 'class_has_document', schema: ClassHasDocumentSchema },
      { name: 'project_send_document', schema: ProjectSendDocumentSchema },
      { name: 'user', schema: UserSchema },
      { name: 'user_has_role', schema: UserHasRoleSchema },
      { name: 'project', schema: ProjectSchema },
      { name: 'project_has_user', schema: ProjectHasUserSchema },
      { name: 'project', schema: ProjectSchema },
    ]),
  ],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    ClassHasDocumentService,
    ProjectSendDocumentService,
    UserService,
    UserHasRoleService,
    ProjectHasUserService,
    ProjectService,
  ],
  exports: [
    DocumentService,
    ClassHasDocumentService,
    ProjectSendDocumentService,
  ],
})
export class DocumentModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(IsAdminMiddleware).forRoutes(
      { path: 'document', method: RequestMethod.POST },
      { path: 'document', method: RequestMethod.GET },
      { path: 'document/:id', method: RequestMethod.PUT },
      {
        path: 'class/:classId/document/:documentId/date',
        method: RequestMethod.PUT,
      },
      {
        path: 'class/:classId/document/:documentId/date/status',
        method: RequestMethod.PATCH,
      },
      { path: 'document/:documentId', method: RequestMethod.DELETE },
    );
    consumer.apply(IsAdminOrAdvisorMiddleware).forRoutes(
      {
        path: 'class/:classId/document',
        method: RequestMethod.GET,
      },
      {
        path: 'class/:classId/document/overview',
        method: RequestMethod.GET,
      },
    );
    consumer.apply(IsStudentMiddleware).forRoutes(
      {
        path: 'project/:projectId/document/:documentId',
        method: RequestMethod.POST,
      },
      {
        path: 'project/:projectId/document/:documentId',
        method: RequestMethod.DELETE,
      },
    );
    consumer.apply(AuthMiddleware).forRoutes(
      {
        path: 'class/:classId/project/:projectId/document/:documentId/detail',
        method: RequestMethod.GET,
      },
      {
        path: 'class/:classId/project/:projectId/document',
        method: RequestMethod.GET,
      },
    );
  }
}
