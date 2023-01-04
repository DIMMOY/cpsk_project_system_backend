import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class Class {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  inviteCode: string;

  @Prop({ default: null })
  endDate: Date | null;

  @Prop({ default: true, required: true })
  complete: boolean;

  @Prop({ required: true })
  major: string;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop()
  lastUpdatedBy: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ClassSchema = SchemaFactory.createForClass(Class);
