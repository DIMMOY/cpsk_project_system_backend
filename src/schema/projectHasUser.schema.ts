import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class ProjectHasUser {
  @Prop({ required: true, type: Types.ObjectId, ref: 'project' })
  projectId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'user' })
  userId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'class' })
  classId: Types.ObjectId;

  // 0 = owner
  // 1 = partner
  // 2 = advisor
  // 3 = committee
  @Prop({ required: true })
  role: number;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop({ default: false })
  isAccept: boolean;

  // if role = 3 (committee)
  @Prop({ default: null, type: Types.ObjectId, ref: 'match_committee' })
  matchCommitteeId: Types.ObjectId;

  // if role = 3 (committee)
  @Prop({
    default: null,
    type: Types.ObjectId,
    ref: 'match_committee_has_group',
  })
  matchCommitteeHasGroupId: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ProjectHasUserSchema =
  SchemaFactory.createForClass(ProjectHasUser);
