import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema()
class Form {
  @Prop({ required: true })
  question: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  weight: number;

  @Prop({ required: true })
  limitScore: number;

  @Prop({ required: true })
  type: number;
}

@Schema({ timestamps: true })
export class Assessment {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  form: Array<Form>;

  @Prop({ required: true })
  score: number;

  @Prop({ required: true })
  feedBack: boolean;

  @Prop({ required: true })
  autoCalculate: boolean;

  @Prop({ required: true })
  assessBy: number;

  @Prop({ default: null })
  deletedAt: Date;

  @Prop()
  lastUpdatedBy: Types.ObjectId;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
