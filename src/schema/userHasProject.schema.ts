import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserHasProject {
  @Prop({ required: true, type: Types.ObjectId, ref: 'project' })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'user' })
  userId: Types.ObjectId;

  @Prop()
  role: number;

  @Prop({ default: null })
  deletedAt: Date;
}

export const UserHasProjectSchema =
  SchemaFactory.createForClass(UserHasProject);
