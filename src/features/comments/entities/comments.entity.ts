import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { PostsEntity } from '../../posts/entities/posts.entity';

@Entity('Comments')
@Unique(['id'])
export class CommentsEntity {
  @PrimaryColumn('uuid', { unique: true })
  id: string;

  @Column({
    type: 'character varying',
    length: 300,
    nullable: false,
  })
  content: string;

  @Column({
    type: 'character varying',
    length: 50,
    nullable: false,
  })
  createdAt: string;

  @Column({ default: false, nullable: false })
  dependencyIsBanned: boolean;

  @Column({ type: 'character varying', nullable: true })
  banDate: string | null = null;

  @Column({ type: 'character varying', nullable: true })
  banReason: string | null = null;

  @Column({ nullable: false, default: false })
  isBanned: boolean;

  @ManyToOne(() => PostsEntity, (post) => post.comments, {
    nullable: false,
    eager: true,
  })
  @JoinColumn([
    { name: 'postId', referencedColumnName: 'id' },
    { name: 'postTitle', referencedColumnName: 'title' },
  ])
  post: PostsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.userId, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'blogOwnerId' })
  blogOwner: UsersEntity;

  @ManyToOne(() => BloggerBlogsEntity, (bloggerBlog) => bloggerBlog.comments, {
    nullable: false,
    eager: true,
  })
  @JoinColumn([
    { name: 'blogId', referencedColumnName: 'id' },
    { name: 'blogName', referencedColumnName: 'name' },
  ])
  blog: BloggerBlogsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.comments, {
    nullable: false,
    eager: true,
  })
  @JoinColumn([
    { name: 'commentatorId', referencedColumnName: 'userId' },
    { name: 'commentatorLogin', referencedColumnName: 'login' },
  ])
  commentator: UsersEntity;
}
