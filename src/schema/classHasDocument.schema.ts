import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ObjectId } from 'mongoose';

@Schema({ timestamps: true })
export class ClassHasDocument {
  @Prop({ required: true })
  classId: ObjectId;

  @Prop({ required: true })
  documentId: ObjectId;

  @Prop({ required: true })
  lastUpdatedBy: ObjectId;

  @Prop({ default: null })
  deletedAt: Date;
}

export const ClassHasDocumentSchema =
  SchemaFactory.createForClass(ClassHasDocument);
