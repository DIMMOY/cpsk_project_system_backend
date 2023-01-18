import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserJoinClass {
  @Prop({ required: true, type: Types.ObjectId, ref: 'user' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'class' })
  classId: Types.ObjectId;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop()
  lastUpdatedBy: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserJoinClassSchema = SchemaFactory.createForClass(UserJoinClass);
