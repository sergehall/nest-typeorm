import {
  Entity,
  Column,
  PrimaryColumn,
  JoinColumn,
  OneToMany,
  ManyToOne,
  Unique,
  OneToOne,
} from 'typeorm';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { PostsEntity } from '../../posts/entities/posts.entity';
import { BannedUsersForBlogsEntity } from '../../users/entities/banned-users-for-blogs.entity';

@Entity('BloggerBlogs')
@Unique(['id'])
@Unique(['id', 'name'])
export class BloggerBlogsEntity {
  @PrimaryColumn('uuid', { nullable: false })
  id: string;

  @Column({ type: 'character varying', length: 50, nullable: false })
  createdAt: string;

  @Column({ nullable: false, default: false })
  isMembership: boolean;

  @Column({ nullable: false, default: true })
  isBanned: boolean;

  @Column({ nullable: false, default: false })
  dependencyIsBanned: boolean;

  @Column({ nullable: false, default: false })
  banInfoIsBanned: boolean;

  @Column({ type: 'character varying', nullable: true })
  banInfoBanDate: string | null = null;

  @Column({ type: 'character varying', nullable: true })
  banInfoBanReason: string | null = null;

  @Column({ type: 'character varying', length: 15, nullable: false })
  name: string;

  @Column({ type: 'character varying', length: 500, nullable: false })
  description: string;

  @Column({ type: 'character varying', length: 100, nullable: false })
  websiteUrl: string;

  @ManyToOne(() => UsersEntity, (user) => user.bloggerBlogs, {
    nullable: false,
    eager: true,
  })
  @JoinColumn([
    { name: 'blogOwnerId', referencedColumnName: 'userId' },
    { name: 'blogOwnerLogin', referencedColumnName: 'login' },
  ])
  blogOwner: UsersEntity;

  @OneToOne(() => BannedUsersForBlogsEntity, (ban) => ban.bannedBlog)
  bannedBlog: BannedUsersForBlogsEntity;

  @OneToMany(() => PostsEntity, (posts) => posts.blog)
  posts: PostsEntity[];

  @OneToMany(() => CommentsEntity, (comments) => comments.blog)
  comments: CommentsEntity[];
}
