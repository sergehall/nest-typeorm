import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
  PrimaryColumn,
} from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { PostsEntity } from './posts.entity';
import { LikeStatusEnums } from '../../../db/enums/like-status.enums';
import { LikeStatusDto } from '../dto/like-status.dto';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import * as uuid4 from 'uuid4';

@Entity('LikeStatusPosts')
@Unique(['id'])
export class LikeStatusPostsEntity {
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
    length: 30,
    nullable: false,
  })
  addedAt: string;

  @Column({ default: false })
  isBanned: boolean;

  @ManyToOne(() => UsersEntity, (user) => user.userId, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'postOwnerId', referencedColumnName: 'userId' })
  postOwner: UsersEntity;

  @ManyToOne(() => UsersEntity, (user) => user.ratedPostUser, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  ratedPostUser: UsersEntity;

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

  static createLikeStatusPostsEntity(
    post: PostsEntity,
    likeStatusDto: LikeStatusDto,
    currentUserDto: CurrentUserDto,
  ): LikeStatusPostsEntity {
    const blogEntity = new BloggerBlogsEntity();
    blogEntity.id = post.blog.id;

    const postOwnerEntity = new UsersEntity();
    postOwnerEntity.userId = post.postOwner.userId;

    const ratedPostUserEntity = new UsersEntity();
    ratedPostUserEntity.userId = currentUserDto.userId;
    ratedPostUserEntity.login = currentUserDto.login;
    ratedPostUserEntity.isBanned = currentUserDto.isBanned;

    const likeStatusPost = new LikeStatusPostsEntity();
    likeStatusPost.id = uuid4().toString();
    likeStatusPost.likeStatus = likeStatusDto.likeStatus;
    likeStatusPost.addedAt = new Date().toISOString();
    likeStatusPost.isBanned = false;
    likeStatusPost.blog = blogEntity;
    likeStatusPost.post = post;
    likeStatusPost.postOwner = postOwnerEntity;
    likeStatusPost.ratedPostUser = ratedPostUserEntity;

    return likeStatusPost;
  }
}
