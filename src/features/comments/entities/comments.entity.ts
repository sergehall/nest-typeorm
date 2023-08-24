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
    nullable: true,
  })
  content: string;

  @Column({
    type: 'character varying',
    length: 50,
    nullable: true,
  })
  createdAt: string;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  postInfoPostId: string;

  @ManyToOne(() => PostsEntity, (post) => post.comments)
  @JoinColumn({ name: 'postInfoPostId' })
  post: PostsEntity;

  @Column({
    type: 'character varying',
    length: 30,
    nullable: true,
  })
  postInfoTitle: string;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  postInfoBlogId: string;

  @Column({
    type: 'character varying',
    length: 15,
    nullable: true,
  })
  postInfoBlogName: string;

  // @ManyToOne(() => BloggerBlogsEntity, (bloggerBlog) => bloggerBlog.posts)
  // @JoinColumn({ name: 'postInfoBlogId', referencedColumnName: 'id' }) // Foreign key column
  // @JoinColumn({ name: 'postInfoBlogName', referencedColumnName: 'name' }) // Foreign key column
  // blog: BloggerBlogsEntity;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  postInfoBlogOwnerId: string;

  @ManyToOne(() => UsersEntity, (user) => user.userId)
  @JoinColumn({ name: 'postInfoBlogOwnerId' })
  blogOwner: UsersEntity;

  @Column({
    type: 'uuid',
    nullable: true,
  })
  commentatorInfoUserId: string;

  @Column({
    type: 'character varying',
    length: 10,
    nullable: true,
  })
  commentatorInfoUserLogin: string;

  @Column({ default: false })
  commentatorInfoIsBanned: boolean;

  // @ManyToOne(() => UsersEntity, (user) => user.comments)
  // @JoinColumn({ name: 'commentatorInfoUserId', referencedColumnName: 'userId' }) // Foreign key column
  // @JoinColumn({
  //   name: 'commentatorInfoUserLogin',
  //   referencedColumnName: 'login',
  // }) // Foreign key column
  // @JoinColumn({
  //   name: 'commentatorInfoIsBanned',
  //   referencedColumnName: 'isBanned',
  // }) // Foreign key column
  // commentator: UsersEntity;

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
}
