import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now } from 'mongoose';

@Schema({ timestamps: true })
export class Project {
  @Prop()
  nameTH: string;

  @Prop()
  nameEN: string;

  @Prop()
  description: string;

  @Prop({ default: null })
  deletedAt: Date;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);
