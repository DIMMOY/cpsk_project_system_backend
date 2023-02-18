import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class ProjectSendDocument {
  @Prop({ required: true, type: Types.ObjectId, ref: 'project' })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'class_has_document' })
  classHasDocumentId: Types.ObjectId;

  @Prop({ required: true })
  pathDocument: Array<string>;

  @Prop({ required: true })
  status: number;

  @Prop()
  lastUpdatedBy: Types.ObjectId;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ProjectSendDocumentSchema =
  SchemaFactory.createForClass(ProjectSendDocument);
