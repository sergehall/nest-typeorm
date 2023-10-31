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
import { BannedUsersForBlogsEntity } from '../../users/entities/banned-users-for-blogs.entity';
import * as uuid4 from 'uuid4';
import { CreateBlogsDto } from '../dto/create-blogs.dto';
import { CurrentUserDto } from '../../users/dto/current-user.dto';

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

  @Column({ nullable: false, default: false })
  dependencyIsBanned: boolean;

  // @Column({ nullable: false, default: false })
  // isBanned: boolean;

  @Column({ nullable: false, default: false })
  isBanned: boolean;

  @Column({ type: 'character varying', nullable: true })
  banDate: string | null = null;

  @Column({ type: 'character varying', nullable: true })
  banReason: string | null = null;

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

  @OneToMany(() => BannedUsersForBlogsEntity, (ban) => ban.bannedBlog)
  bannedBlog: BannedUsersForBlogsEntity[];

  @OneToMany(() => PostsEntity, (posts) => posts.blog)
  posts: PostsEntity[];

  @OneToMany(() => CommentsEntity, (comments) => comments.blog)
  comments: CommentsEntity[];

  static createBlogEntity(
    dto: CreateBlogsDto,
    currentUser: CurrentUserDto,
  ): BloggerBlogsEntity {
    const { userId, login, isBanned } = currentUser;
    const { name, description, websiteUrl } = dto;

    const user = new UsersEntity();
    user.userId = userId;
    user.login = login;

    const newBlog = new BloggerBlogsEntity();
    newBlog.id = uuid4();
    newBlog.name = name;
    newBlog.description = description;
    newBlog.websiteUrl = websiteUrl;
    newBlog.createdAt = new Date().toISOString();
    newBlog.isMembership = false;
    newBlog.dependencyIsBanned = isBanned;
    newBlog.isBanned = false;
    newBlog.banDate = null;
    newBlog.banReason = null;
    newBlog.blogOwner = user;

    return newBlog;
  }
}
