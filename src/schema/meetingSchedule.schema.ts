import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class MeetingSchedule {
  @Prop({ required: true })
  name: string;

  @Prop({ default: true })
  status: boolean;

  @Prop({ default: null })
  deletedAt: Date;
}

export const MeetingScheduleSchema =
  SchemaFactory.createForClass(MeetingSchedule);
