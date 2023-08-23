import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { Users } from '../../users/entities/users.entity';

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

  // @ManyToOne(() => PostsEntity, (post) => post.comments)
  // @JoinColumn({ name: 'postInfoPostId' })
  // post: PostsEntity;

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

  @ManyToOne(() => Users, (user) => user.userId)
  @JoinColumn({ name: 'postInfoBlogOwnerId' })
  blogOwner: Users;

  @ManyToOne(() => Users, (user) => user.userId)
  @JoinColumn({ name: 'commentatorInfoUserId' })
  commentator: Users;

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

  // You might have other decorators and properties here based on your use case

  // Constraints are generally managed in migrations
}
