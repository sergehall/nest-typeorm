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
    type: 'varchar',
    length: 300,
    collation: 'pg_catalog."default"',
    nullable: true,
  })
  content: string;

  @Column({
    type: 'varchar',
    length: 50,
    collation: 'pg_catalog."default"',
    nullable: true,
  })
  createdAt: string;

  @Column({
    type: 'varchar',
    length: 30,
    collation: 'pg_catalog."default"',
    nullable: true,
  })
  postInfoTitle: string;

  @ManyToOne(() => BloggerBlogsEntity, (blog) => blog.comments)
  @JoinColumn({ name: 'postInfoBlogId' })
  blog: BloggerBlogsEntity;

  @Column({
    type: 'varchar',
    length: 15,
    collation: 'pg_catalog."default"',
    nullable: true,
  })
  postInfoBlogName: string;

  @Column({
    type: 'varchar',
    length: 10,
    collation: 'pg_catalog."default"',
    nullable: true,
  })
  commentatorInfoUserLogin: string;

  @Column({ default: false })
  commentatorInfoIsBanned: boolean;

  @Column({ default: false })
  banInfoIsBanned: boolean;

  @Column({
    type: 'varchar',
    length: 50,
    collation: 'pg_catalog."default"',
    nullable: true,
  })
  banInfoBanDate: string;

  @Column({
    type: 'varchar',
    length: 300,
    collation: 'pg_catalog."default"',
    nullable: true,
  })
  banInfoBanReason: string;

  @ManyToOne(() => UsersEntity, (user) => user.userId)
  @JoinColumn({ name: 'postInfoBlogOwnerId' })
  blogOwner: UsersEntity;

  @ManyToOne(() => UsersEntity, (user) => user.userId)
  @JoinColumn({ name: 'commentatorInfoUserId' })
  commentator: UsersEntity;

  @ManyToOne(() => PostsEntity, (post) => post.post)
  @JoinColumn({ name: 'postInfoPostId' })
  post: PostsEntity;
}
