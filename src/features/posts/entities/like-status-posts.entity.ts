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
import { LikeStatusEnums } from '../../../config/db/mongo/enums/like-status.enums';

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
}
