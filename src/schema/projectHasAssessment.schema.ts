import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class ProjectHasAssessment {
  @Prop({ required: true, type: Types.ObjectId, ref: 'project' })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'class_has_assessment' })
  classHasAssessmentId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'user' })
  userId: Types.ObjectId;

  @Prop({ required: true })
  form: Array<number>;

  @Prop({ required: true })
  limitScore: number;

  @Prop({ required: true })
  rawScore: number;

  @Prop({ required: true })
  sumScore: number;

  @Prop({ required: true })
  // 1 from advisor
  // 2 from committee
  assessBy: number;

  // if assessBy = 2 (committee)
  @Prop({
    default: null,
    type: Types.ObjectId,
    ref: 'match_committee',
  })
  matchCommitteeId: Types.ObjectId;

  @Prop({ default: null })
  feedBack: string | null;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop()
  lastUpdatedBy: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ProjectHasAssessmentSchema =
  SchemaFactory.createForClass(ProjectHasAssessment);
