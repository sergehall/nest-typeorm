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

  @Column({ default: false })
  banInfoIsBanned: boolean;

  @Column({
    type: 'character varying',
    length: 50,
    nullable: true,
  })
  banInfoBanDate: string;

  @Column({
    type: 'character varying',
    length: 300,
    nullable: true,
  })
  banInfoBanReason: string;

  @ManyToOne(() => PostsEntity, (post) => post.comments, { nullable: false })
  @JoinColumn([
    { name: 'postInfoPostId', referencedColumnName: 'id' },
    { name: 'postInfoTitle', referencedColumnName: 'title' },
  ])
  post: PostsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.userId, { nullable: false })
  @JoinColumn({ name: 'postInfoBlogOwnerId' })
  blogOwner: UsersEntity;

  @ManyToOne(() => BloggerBlogsEntity, (bloggerBlog) => bloggerBlog.comments, {
    nullable: false,
  })
  @JoinColumn([
    { name: 'postInfoBlogId', referencedColumnName: 'id' },
    { name: 'postInfoBlogName', referencedColumnName: 'name' },
  ])
  blog: BloggerBlogsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.comments, { nullable: false })
  @JoinColumn([
    { name: 'commentatorInfoUserId', referencedColumnName: 'userId' },
    { name: 'commentatorInfoUserLogin', referencedColumnName: 'login' },
    {
      name: 'commentatorInfoIsBanned',
      referencedColumnName: 'isBanned',
    },
  ])
  commentator: UsersEntity;
}
