import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentController } from 'src/controllers/document.controller';
import { ClassHasDocumentSchema } from 'src/schema/classHasDocument.schema';
import { DocumentSchema } from 'src/schema/document.schema';
import { ProjectSendDocumentSchema } from 'src/schema/projectSendDocument.schema';
import { ClassHasDocumentService } from 'src/services/classHasDocument.service';
import { DocumentService } from 'src/services/document.service';
import { ProjectSendDocumentService } from 'src/services/projectSendDocument.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'document', schema: DocumentSchema },
      { name: 'class_has_document', schema: ClassHasDocumentSchema },
      { name: 'project_send_document', schema: ProjectSendDocumentSchema },
    ]),
  ],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    ClassHasDocumentService,
    ProjectSendDocumentService,
  ],
  exports: [
    DocumentService,
    ClassHasDocumentService,
    ProjectSendDocumentService,
  ],
})
export class DocumentModule {}
