import { StatusLike } from '../../../../config/db/mongo/enums/like-status.enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CommentsDocument = HydratedDocument<Comments>;

@Schema()
export class BanInfo {
  @Prop({ required: true })
  isBanned: boolean;
  @Prop({ type: String, default: null })
  banDate: string | null;
  @Prop({ type: String, default: null })
  banReason: string | null;
}
class PostInfo {
  @Prop({ required: true })
  id: string;
  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true })
  blogName: string;
  @Prop({ required: true })
  blogOwnerId: string;
}

class CommentatorInfo {
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  userLogin: string;
  @Prop({ required: true })
  isBanned: boolean;
}

@Schema()
export class LikesInfo {
  @Prop({ required: true })
  likesCount: number;
  @Prop({ required: true })
  dislikesCount: number;
  @Prop({ required: true, default: StatusLike.NONE })
  myStatus: StatusLike;
}
@Schema()
export class Comments {
  @Prop({ required: true, unique: true })
  id: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true, type: PostInfo })
  postInfo: PostInfo;
  @Prop({ required: true, type: CommentatorInfo })
  commentatorInfo: CommentatorInfo;
  @Prop({ required: true, type: LikesInfo })
  likesInfo: LikesInfo;
  @Prop({ required: true, type: BanInfo })
  banInfo: BanInfo;
}

export const CommentsSchema = SchemaFactory.createForClass(Comments);
