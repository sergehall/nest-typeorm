import {
  Entity,
  Column,
  Unique,
  PrimaryColumn,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { UsersEntity } from './users.entity';

@Entity('BannedUserForBlog')
@Unique(['id'])
export class BannedUserForBlogEntity {
  @PrimaryColumn({ nullable: false, unique: true })
  id: number;

  @Column({ type: 'character varying', nullable: true })
  banDate: string | null = null;

  @Column({ type: 'character varying', nullable: true })
  banReason: string | null = null;

  @OneToOne(() => BloggerBlogsEntity, (blog) => blog.bannedBlog, {
    nullable: false,
  })
  @JoinColumn({ name: 'blogId', referencedColumnName: 'id' })
  bannedBlog: BloggerBlogsEntity;

  @OneToOne(() => UsersEntity, (user) => user.bannedBlogForUser, {
    nullable: false,
  })
  @JoinColumn([
    { name: 'userId', referencedColumnName: 'userId' },
    { name: 'login', referencedColumnName: 'login' },
    { name: 'isBanned', referencedColumnName: 'isBanned' },
  ])
  bannedUserForBlog: UsersEntity[];
}
