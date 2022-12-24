import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentController } from 'src/controllers/document.controller';
import { DocumentSchema } from 'src/schema/document.schema';
import { DocumentService } from 'src/services/document.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'document', schema: DocumentSchema }]),
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
