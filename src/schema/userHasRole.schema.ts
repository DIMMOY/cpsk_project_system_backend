import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class UserHasRole {
  @Prop({ required: true, type: Types.ObjectId, ref: 'user' })
  userId: Types.ObjectId;

  // 0 = student
  // 1 = advisor
  // 2 = admin
  @Prop({ required: true })
  role: number;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({ required: true })
  currentRole: boolean;

  @Prop()
  lastUpdatedBy: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const UserHasRoleSchema = SchemaFactory.createForClass(UserHasRole);
