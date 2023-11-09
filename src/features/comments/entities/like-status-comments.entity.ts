import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { CommentsEntity } from './comments.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { PostsEntity } from '../../posts/entities/posts.entity';
import { LikeStatusEnums } from '../../../db/enums/like-status.enums';
import { LikeStatusDto } from '../dto/like-status.dto';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import * as uuid4 from 'uuid4';

@Entity('LikeStatusComments')
@Unique(['id'])
export class LikeStatusCommentsEntity {
  @PrimaryColumn('uuid', { nullable: false, unique: true })
  id: string;

  @Column({
    type: 'enum',
    enum: LikeStatusEnums,
    default: LikeStatusEnums.NONE,
    nullable: false,
  })
  likeStatus: LikeStatusEnums;

  @Column({
    type: 'character varying',
    length: 50,
    nullable: false,
  })
  addedAt: string;

  @Column({ default: false })
  isBanned: boolean;

  @ManyToOne(() => CommentsEntity, (comment) => comment.id, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'commentId', referencedColumnName: 'id' })
  comment: CommentsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.ratedCommentUser, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  ratedCommentUser: UsersEntity;

  @ManyToOne(() => BloggerBlogsEntity, (blog) => blog.id, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'blogId', referencedColumnName: 'id' })
  blog: BloggerBlogsEntity;

  @ManyToOne(() => PostsEntity, (post) => post.id, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'postId', referencedColumnName: 'id' })
  post: PostsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.userId, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'commentOwnerId', referencedColumnName: 'userId' })
  commentOwner: UsersEntity;

  static createLikeStatusCommentsEntity(
    findComment: CommentsEntity,
    likeStatusDto: LikeStatusDto,
    currentUserDto: CurrentUserDto,
  ): LikeStatusCommentsEntity {
    const blogEntity = new BloggerBlogsEntity();
    blogEntity.id = findComment.blog.id;

    const postEntity = new PostsEntity();
    postEntity.id = findComment.post.id;

    const ownerUserEntity = new UsersEntity();
    ownerUserEntity.userId = findComment.commentator.userId;

    const ratedUserEntity = new UsersEntity();
    ratedUserEntity.userId = currentUserDto.userId;
    ratedUserEntity.login = currentUserDto.login;
    ratedUserEntity.isBanned = currentUserDto.isBanned;

    const commentEntity = new CommentsEntity();
    commentEntity.id = findComment.id;

    const likeStatusComment = new LikeStatusCommentsEntity();
    likeStatusComment.id = uuid4().toString();
    likeStatusComment.likeStatus = likeStatusDto.likeStatus;
    likeStatusComment.addedAt = new Date().toISOString();
    likeStatusComment.isBanned = false;
    likeStatusComment.comment = commentEntity;
    likeStatusComment.ratedCommentUser = ratedUserEntity;
    likeStatusComment.blog = blogEntity;
    likeStatusComment.post = postEntity;
    likeStatusComment.commentOwner = ownerUserEntity;

    return likeStatusComment;
  }
}
