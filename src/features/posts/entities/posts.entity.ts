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

@Entity('Posts')
@Unique(['id'])
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

  @Column({ default: false })
  dependencyIsBanned: boolean;

  @Column({ default: false })
  banInfoIsBanned: boolean;

  @Column({ type: 'character varying', nullable: true })
  banInfoBanDate: string | null = null;

  @Column({ type: 'character varying', nullable: true })
  banInfoBanReason: string | null = null;

  @Column('uuid')
  blogId: string;

  @Column({
    type: 'character varying',
    length: 15,
    nullable: false,
  })
  blogName: string;

  // @ManyToOne(() => BloggerBlogsEntity, (bloggerBlog) => bloggerBlog.posts)
  // @JoinColumn([
  //   { name: 'blogId', referencedColumnName: 'id' },
  //   { name: 'blogName', referencedColumnName: 'name' },
  // ])
  // blogOwner: BloggerBlogsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.userId)
  @JoinColumn({ name: 'postOwnerId' })
  postOwner: UsersEntity;

  @OneToMany(() => CommentsEntity, (comment) => comment.post)
  @JoinColumn({ name: 'postInfoPostId' })
  comments: CommentsEntity[];
}
