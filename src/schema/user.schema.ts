import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { now } from 'mongoose';

@Schema({ timestamps: true })
export class User {
  @Prop()
  email: string;

  @Prop()
  displayName: string;

  @Prop({ default: now() })
  lastLoginAt: Date;

  @Prop({ default: null })
  deletedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
