import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserHasRole {
  @Prop({ required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  role: number;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserHasRoleSchema = SchemaFactory.createForClass(UserHasRole);
