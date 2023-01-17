import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { StatusLike } from '../../../infrastructure/database/enums/like-status.enums';

export type LikeStatusPostsDocument = HydratedDocument<LikeStatusPost>;

@Schema()
export class LikeStatusPost {
  @Prop({ required: true })
  postId: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  login: string;
  @Prop({ required: true, enum: StatusLike })
  likeStatus: StatusLike;
  @Prop({ required: true })
  addedAt: string;
}

export const LikeStatusPostSchema =
  SchemaFactory.createForClass(LikeStatusPost);
