import { Entity, PrimaryColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';

@Entity('LikeStatusPosts')
export class LikeStatusPostsEntity {
  @PrimaryColumn('uuid', { nullable: false })
  userId: string;

  @ManyToOne(() => BloggerBlogsEntity, (blog) => blog.id)
  @JoinColumn({ name: 'blogId' })
  blog: BloggerBlogsEntity;

  @Column({ default: false })
  isBanned: boolean;

  @Column({
    type: 'character varying',
    length: 10,
    nullable: false,
  })
  login: string;

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

  @ManyToOne(() => UsersEntity, (user) => user.userId)
  @JoinColumn({ name: 'postOwnerId' })
  postOwner: UsersEntity;

  @PrimaryColumn('uuid', { nullable: false })
  postId: string;

  @ManyToOne(() => UsersEntity, (user) => user.userId)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
