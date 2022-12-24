import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ timestamps: true })
export class Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ default: null })
  deletedAt: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(Document);
