import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class ClassHasAssessment {
  @Prop({ required: true, type: Types.ObjectId, ref: 'class' })
  classId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'assessment' })
  assessmentId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'match_committee' })
  matchCommitteeId: Array<Types.ObjectId>;

  @Prop({ default: null })
  startDate: Date;

  @Prop({ default: null })
  endDate: Date;

  @Prop()
  lastUpdatedBy: Types.ObjectId;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({ default: true })
  status: boolean;
}

export const ClassHasAssessmentSchema =
  SchemaFactory.createForClass(ClassHasAssessment);
