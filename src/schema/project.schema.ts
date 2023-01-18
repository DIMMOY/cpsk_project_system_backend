import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  nameTH: string;

  @Prop({ required: true })
  nameEN: string;

  @Prop({ required: true, type: Types.ObjectId, ref: 'class' })
  classId: Types.ObjectId;

  @Prop({ default: null })
  description: string;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
