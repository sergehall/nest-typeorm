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
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import * as uuid4 from 'uuid4';

@Entity('Comments')
@Unique(['id'])
export class CommentsEntity {
  @PrimaryColumn('uuid', { unique: true })
  id: string;

  @Column({
    type: 'character varying',
    length: 300,
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

  @Column({ type: 'character varying', nullable: true })
  banDate: string | null = null;

  @Column({ type: 'character varying', nullable: true })
  banReason: string | null = null;

  @Column({ nullable: false, default: false })
  isBanned: boolean;

  @ManyToOne(() => PostsEntity, (post) => post.comments, {
    nullable: false,
    eager: true,
  })
  @JoinColumn([
    { name: 'postId', referencedColumnName: 'id' },
    { name: 'postTitle', referencedColumnName: 'title' },
  ])
  post: PostsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.userId, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'blogOwnerId', referencedColumnName: 'userId' })
  blogOwner: UsersEntity;

  @ManyToOne(() => BloggerBlogsEntity, (bloggerBlog) => bloggerBlog.comments, {
    nullable: false,
    eager: true,
  })
  @JoinColumn([
    { name: 'blogId', referencedColumnName: 'id' },
    { name: 'blogName', referencedColumnName: 'name' },
  ])
  blog: BloggerBlogsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.comments, {
    nullable: false,
    eager: true,
  })
  @JoinColumn([
    { name: 'commentatorId', referencedColumnName: 'userId' },
    { name: 'commentatorLogin', referencedColumnName: 'login' },
  ])
  commentator: UsersEntity;

  static createCommentsEntity(
    post: PostsEntity,
    createCommentDto: CreateCommentDto,
    currentUserDto: CurrentUserDto,
  ): CommentsEntity {
    const { content } = createCommentDto;

    const commentator = new UsersEntity();
    commentator.userId = currentUserDto.userId;
    commentator.login = currentUserDto.login;

    const blogOwner = new UsersEntity();
    blogOwner.userId = post.postOwner.userId;

    const blog = new BloggerBlogsEntity();
    blog.id = post.blog.id;
    blog.name = post.blog.name;

    const commentsEntity = new CommentsEntity();
    commentsEntity.id = uuid4().toString();
    commentsEntity.content = content;
    commentsEntity.createdAt = new Date().toISOString();
    commentsEntity.isBanned = false;
    commentsEntity.banDate = null;
    commentsEntity.banReason = null;
    commentsEntity.dependencyIsBanned = false;
    commentsEntity.isBanned = false;
    commentsEntity.blog = blog;
    commentsEntity.blogOwner = blogOwner;
    commentsEntity.post = post;
    commentsEntity.commentator = commentator;

    return commentsEntity;
  }
}
