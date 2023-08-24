import {
  Entity,
  Column,
  PrimaryColumn,
  JoinColumn,
  OneToMany,
  ManyToOne,
  Unique,
} from 'typeorm';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { PostsEntity } from '../../posts/entities/posts.entity';
import { BannedUsersForBlogsEntity } from './banned-users-for-blogs.entity';

@Entity('BloggerBlogs')
@Unique(['id'])
@Unique(['blogOwnerLogin', 'blogOwnerId'])
export class BloggerBlogsEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'character varying', length: 50, nullable: false })
  createdAt: string;

  @Column({ nullable: false, default: false })
  isMembership: boolean;

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

  @Column('uuid')
  blogOwnerId: string;

  @Column({
    type: 'character varying',
    length: 10,
    nullable: false,
  })
  blogOwnerLogin: string;

  @ManyToOne(() => UsersEntity, (user) => user.bloggerBlogs)
  @JoinColumn([
    { name: 'blogOwnerId', referencedColumnName: 'userId' },
    { name: 'blogOwnerLogin', referencedColumnName: 'login' },
  ])
  blogOwner: UsersEntity;

  // @OneToMany(() => BannedUsersForBlogsEntity, (bannedUsers) => bannedUsers.blog)
  // bannedUsers: BannedUsersForBlogsEntity[];
  //
  // @OneToMany(() => PostsEntity, (posts) => posts.blogOwner)
  // posts: PostsEntity[];
  //
  // @OneToMany(() => CommentsEntity, (comments) => comments.blog)
  // comments: CommentsEntity[];
}
