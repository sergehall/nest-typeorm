import { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { StatusLike } from '../../../infrastructure/database/enums/like-status.enums';

export type LikeStatusCommentDocument = HydratedDocument<LikeStatusComment>;

@Schema()
export class LikeStatusComment {
  @Prop({ required: true })
  commentId: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true, enum: StatusLike })
  likeStatus: StatusLike;
  @Prop({ required: true })
  createdAt: string;
}

export const LikeStatusCommentSchema =
  SchemaFactory.createForClass(LikeStatusComment);
