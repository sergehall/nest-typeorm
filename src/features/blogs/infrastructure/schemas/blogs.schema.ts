import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BlogsDocument = HydratedDocument<Blog>;

@Schema()
export class Blog {
  @Prop({ required: true, unique: true })
  id: string;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  description: string;
  @Prop({ required: true })
  websiteUrl: string;
  @Prop({ required: true })
  createdAt: string;
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
