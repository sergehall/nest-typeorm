import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { CommentsEntity } from './comments.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';

@Entity('LikeStatusComments')
export class LikeStatusCommentsEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: false })
  isBanned: boolean;

  @Column({
    type: 'varchar',
    length: 7,
    nullable: false,
  })
  likeStatus: string;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
  })
  createdAt: string;

  @ManyToOne(() => CommentsEntity, (comment) => comment.id, { nullable: false })
  @JoinColumn({ name: 'commentId' })
  comment: CommentsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.ratedCommentUser, {
    nullable: false,
  })
  @JoinColumn([{ name: 'userId' }, { name: 'login' }, { name: 'isBanned' }])
  ratedCommentUser: UsersEntity;

  @ManyToOne(() => BloggerBlogsEntity, (blog) => blog.id, { nullable: false })
  @JoinColumn({ name: 'blogId', referencedColumnName: 'id' })
  blog: BloggerBlogsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.userId, { nullable: false })
  @JoinColumn({ name: 'commentOwnerId' })
  commentOwner: UsersEntity;
}
