import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
  Unique,
  OneToMany,
} from 'typeorm';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { LikeStatusCommentsEntity } from '../../comments/entities/like-status-comments.entity';

@Entity('Posts')
@Unique(['id'])
@Unique(['id', 'title'])
export class PostsEntity {
  @PrimaryColumn('uuid', { nullable: false, unique: true })
  id: string;

  @Column({
    type: 'character varying',
    length: 30,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'character varying',
    length: 100,
    nullable: false,
  })
  shortDescription: string;

  @Column({
    type: 'character varying',
    length: 1000,
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

  @Column({ nullable: false, default: false })
  isBanned: boolean;

  @Column({ type: 'character varying', nullable: true })
  banDate: string | null = null;

  @Column({ type: 'character varying', nullable: true })
  banReason: string | null = null;

  @ManyToOne(() => BloggerBlogsEntity, (bloggerBlog) => bloggerBlog.posts, {
    nullable: false,
    eager: true,
  })
  @JoinColumn([
    { name: 'blogId', referencedColumnName: 'id' },
    { name: 'blogName', referencedColumnName: 'name' },
  ])
  blog: BloggerBlogsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.userId, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'postOwnerId', referencedColumnName: 'userId' })
  postOwner: UsersEntity;

  @OneToMany(() => CommentsEntity, (comment) => comment.post)
  comments: CommentsEntity[];

  @OneToMany(() => LikeStatusCommentsEntity, (LikeStatus) => LikeStatus.post)
  likeStatusComments: LikeStatusCommentsEntity[];
}
