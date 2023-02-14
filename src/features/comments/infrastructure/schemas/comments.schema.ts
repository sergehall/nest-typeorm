import { StatusLike } from '../../../../infrastructure/database/enums/like-status.enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CommentsEntity } from '../../entities/comments.entity';

export type CommentsDocument = HydratedDocument<Comments>;

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
export class Comment {
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true, unique: true })
  id: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true, type: CommentatorInfo })
  commentatorInfo: CommentatorInfo;
  @Prop({ required: true, type: LikesInfo })
  likesInfo: LikesInfo;
}
@Schema()
export class Comments {
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true, unique: true })
  postId: string;
  @Prop({ required: true, default: [] })
  comments: Comment[];
  async addComments(comment: CommentsEntity) {
    this.comments.push(comment);
  }
}
export const CommentsSchema = SchemaFactory.createForClass(Comments);
CommentsSchema.methods = {
  addComments: Comments.prototype.addComments,
};
