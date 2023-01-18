import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class ClassHasMeetingSchedule {
  @Prop({ required: true, type: Types.ObjectId, ref: 'class' })
  classId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'meeting_schedule' })
  meetingScheduleId: Types.ObjectId;

  @Prop({ default: null })
  startDate: Date;

  @Prop({ default: null })
  endDate: Date;

  @Prop()
  lastUpdatedBy: Types.ObjectId;

  @Prop({ default: null })
  deletedAt: Date;
}

export const ClassHasMeetingScheduleSchema = SchemaFactory.createForClass(
  ClassHasMeetingSchedule,
);
