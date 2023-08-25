import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { PostsEntity } from './posts.entity';

@Entity('LikeStatusPosts')
export class LikeStatusPostsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'character varying',
    length: 7,
    nullable: false,
  })
  likeStatus: string;

  @Column({
    type: 'varchar',
    length: 30,
    nullable: false,
  })
  addedAt: string;

  @ManyToOne(() => UsersEntity, (user) => user.userId, { nullable: false })
  @JoinColumn({ name: 'postOwnerId', referencedColumnName: 'userId' })
  postOwner: UsersEntity;

  @ManyToOne(() => UsersEntity, (user) => user.ratedPostUser, {
    nullable: false,
  })
  @JoinColumn([{ name: 'userId' }, { name: 'login' }, { name: 'isBanned' }])
  ratedPostUser: UsersEntity;

  @ManyToOne(() => BloggerBlogsEntity, (blog) => blog.id, { nullable: false })
  @JoinColumn({ name: 'blogId', referencedColumnName: 'id' })
  blog: BloggerBlogsEntity;

  @ManyToOne(() => PostsEntity, (post) => post.id, { nullable: false })
  @JoinColumn({ name: 'postId', referencedColumnName: 'id' })
  post: PostsEntity;
}
