import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BBlogsDocument = HydratedDocument<BBlogs>;
@Schema()
export class BlogsOwnerInfo {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  userLogin: string;
  @Prop({ required: true })
  isBanned: boolean;
}
@Schema()
export class BBlogs {
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
  isMembership: boolean;
  @Prop({ required: true })
  blogOwnerInfo: BlogsOwnerInfo;
}

export const BBlogsSchema = SchemaFactory.createForClass(BBlogs);
