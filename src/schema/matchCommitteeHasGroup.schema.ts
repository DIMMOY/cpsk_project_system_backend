import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true })
export class MatchCommitteeHasGroup {
  @Prop({ required: true, type: Types.ObjectId, ref: 'match_committee' })
  matchCommitteeId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'user' })
  userId: Array<Types.ObjectId>;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const MatchCommitteeHasGroupSchema = SchemaFactory.createForClass(
  MatchCommitteeHasGroup,
);
