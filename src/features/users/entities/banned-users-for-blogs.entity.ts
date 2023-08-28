import {
  Entity,
  Column,
  Unique,
  PrimaryColumn,
  JoinColumn,
  OneToOne,
  ManyToOne,
} from 'typeorm';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { UsersEntity } from './users.entity';

@Entity('BannedUsersForBlogs')
@Unique(['id'])
export class BannedUsersForBlogsEntity {
  @PrimaryColumn('uuid', { nullable: false, unique: true })
  id: string;

  @Column({ type: 'character varying', nullable: false })
  banDate: string;

  @Column({ type: 'character varying', nullable: false })
  banReason: string;

  @Column({ nullable: false, default: true })
  isBanned: boolean;

  @OneToOne(() => BloggerBlogsEntity, (blog) => blog.bannedBlog, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'blogId', referencedColumnName: 'id' })
  bannedBlog: BloggerBlogsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.bannedBlogsForUser, {
    nullable: false,
    eager: true,
  })
  @JoinColumn([
    { name: 'userId', referencedColumnName: 'userId' },
    { name: 'login', referencedColumnName: 'login' },
  ])
  bannedUserForBlogs: UsersEntity;
}
