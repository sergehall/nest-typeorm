import { StatusLike } from '../../../infrastructure/database/enums/like-status.enums';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { CommentsEntity } from '../../entities/comment.entity';

export type CommentsDocument = HydratedDocument<Comments>;

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
  @Prop({ required: true, unique: true })
  id: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  userId: string;
  @Prop({ required: true })
  userLogin: string;
  @Prop({ required: true })
  createdAt: string;
  @Prop({ required: true })
  likesInfo: LikesInfo;
}
@Schema()
export class Comments {
  @Prop({ required: true, unique: true })
  postId: string;
  @Prop({ required: true, default: [] })
  comments: Comment[];
  async addComment(comment: CommentsEntity) {
    this.comments.push(comment);
  }
}
export const CommentsSchema = SchemaFactory.createForClass(Comments);
CommentsSchema.methods = {
  addComment: Comments.prototype.addComment,
};
