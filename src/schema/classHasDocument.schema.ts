import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class ClassHasDocument {
  @Prop({ required: true })
  classId: Types.ObjectId;

  @Prop({ required: true })
  documentId: Types.ObjectId;

  // @Prop({ default: null })
  // description: string;

  @Prop()
  lastUpdatedBy: Types.ObjectId;

  @Prop({ default: null })
  deletedAt: Date;
}

export const ClassHasDocumentSchema =
  SchemaFactory.createForClass(ClassHasDocument);
