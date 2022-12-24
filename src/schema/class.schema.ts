import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Class {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  inviteCode: string;

  @Prop({ required: true })
  endDate: Date | null;

  @Prop({ default: 0 })
  status: number;

  @Prop({ required: true })
  major: string;

  @Prop({ default: null })
  deletedAt: Date;
}

export const ClassSchema = SchemaFactory.createForClass(Class);
