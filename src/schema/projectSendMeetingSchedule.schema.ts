import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class ProjectSendMeetingSchedule {
  @Prop({ required: true, type: Types.ObjectId, ref: 'project' })
  projectId: Types.ObjectId;

  @Prop({
    required: true,
    type: Types.ObjectId,
    ref: 'class_has_meeting_schedule',
  })
  classHasMeetingScheduleId: Types.ObjectId;

  @Prop({ required: true })
  detail: string;

  @Prop({ required: true, default: false })
  status: boolean;

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
