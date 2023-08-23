import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { CommentsEntity } from './comments.entity';
import { Users } from '../../users/entities/users.entity';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';

@Entity('LikeStatusComments')
export class LikeStatusCommentsEntity {
  @PrimaryColumn('uuid', { nullable: false })
  commentId: string;

  @PrimaryColumn('uuid', { nullable: false })
  userId: string;

  @ManyToOne(() => CommentsEntity, (comment) => comment.id)
  @JoinColumn({ name: 'commentId' })
  comment: CommentsEntity;

  @ManyToOne(() => Users, (user) => user.userId)
  @JoinColumn({ name: 'userId' })
  user: Users;

  @ManyToOne(() => BloggerBlogsEntity, (blog) => blog.id)
  @JoinColumn({ name: 'blogId' })
  blog: BloggerBlogsEntity;

  @Column({ nullable: false })
  isBanned: boolean;

  @Column({
    type: 'varchar',
    length: 7,
    collation: 'pg_catalog."default"',
    nullable: false,
  })
  likeStatus: string;

  @Column({
    type: 'varchar',
    length: 50,
    collation: 'pg_catalog."default"',
    nullable: false,
  })
  createdAt: string;

  @ManyToOne(() => Users, (user) => user.userId)
  @JoinColumn({ name: 'commentOwnerId' })
  commentOwner: Users;

  // You might have other decorators and properties here based on your use case

  // Constraints are generally managed in migrations
}
