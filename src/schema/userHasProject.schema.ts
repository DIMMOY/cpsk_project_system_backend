import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserHasProject {
  @Prop({ required: true })
  projectId: Types.ObjectId;

  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop()
  role: number;

  @Prop({ default: null })
  deletedAt: Date;
}

export const UserHasProjectSchema =
  SchemaFactory.createForClass(UserHasProject);
