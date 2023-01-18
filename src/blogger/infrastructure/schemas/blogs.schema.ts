import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BBlogsDocument = HydratedDocument<BBlog>;
@Schema()
export class BlogOwnerInfo {
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  login: string;
}
@Schema()
export class BBlog {
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
  @Prop({ required: true })
  blogOwnerInfo: BlogOwnerInfo;
}

export const BBlogSchema = SchemaFactory.createForClass(BBlog);
