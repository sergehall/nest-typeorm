import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { StatusLike } from '../../../infrastructure/database/enums/like-status.enums';

export type PostsDocument = HydratedDocument<Post>;

@Schema()
export class NewestLikes {
  @Prop({ required: true })
  addedAt: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  login: string;
}

@Schema()
export class ExtendedLikesInfo {
  @Prop({ required: true })
  likesCount: number;
  @Prop({ required: true })
  dislikesCount: number;
  @Prop({ required: true })
  myStatus: StatusLike;
  @Prop({ required: true })
  newestLikes: NewestLikes[];
}

@Schema()
export class Post {
  @Prop({ required: true, unique: true })
  id: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  shortDescription: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true })
  blogName: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true })
  extendedLikesInfo: ExtendedLikesInfo;
}

export const PostsSchema = SchemaFactory.createForClass(Post);
