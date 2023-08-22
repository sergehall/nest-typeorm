import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';

@Entity('LikeStatusPosts')
export class LikeStatusPostsEntity {
  @PrimaryColumn('uuid')
  userId: string;

  @PrimaryColumn('uuid')
  postId: string;

  @ManyToOne(() => UsersEntity, (user) => user.userId)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @ManyToOne(() => BloggerBlogsEntity, (blog) => blog.id)
  @JoinColumn({ name: 'blogId' })
  blog: BloggerBlogsEntity;

  @Column()
  isBanned: boolean;

  @Column({ type: 'varchar', length: 10, collation: 'pg_catalog."default"' })
  login: string;

  @Column({ type: 'varchar', length: 7, collation: 'pg_catalog."default"' })
  likeStatus: string;

  @Column({ type: 'varchar', length: 30, collation: 'pg_catalog."default"' })
  addedAt: string;

  @ManyToOne(() => UsersEntity, (user) => user.userId)
  @JoinColumn({ name: 'postOwnerId' })
  postOwner: UsersEntity;

  // You might have other decorators and properties here based on your use case

  // Constraints are generally managed in migrations
}
