import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now, ObjectId } from 'mongoose';

@Schema({ timestamps: true })
export class UserHasProject {
  @Prop()
  userId: ObjectId;

  @Prop()
  status: string;

  @Prop({ default: null })
  deletedAt: Date;
}

export const UserHasProjectSchema =
  SchemaFactory.createForClass(UserHasProject);
