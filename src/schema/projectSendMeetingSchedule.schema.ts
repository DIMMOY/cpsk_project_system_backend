import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class ProjectSendMeetingSchedule {
  @Prop({ required: true, type: Types.ObjectId, ref: 'project' })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'meeting_schedule' })
  meetingScheduleId: Types.ObjectId;

  @Prop({ required: true })
  status: number;

  @Prop()
  lastUpdatedBy: Types.ObjectId;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ProjectSendMeetingScheduleSchema = SchemaFactory.createForClass(
  ProjectSendMeetingSchedule,
);
