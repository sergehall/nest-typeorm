import {
  Entity,
  Column,
  Unique,
  Check,
  ManyToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { BloggerBlogsEntity } from './blogger-blogs.entity';
import { UsersEntity } from '../../users/entities/users.entity';

@Entity('BannedUsersForBlogs')
@Unique(['blogId', 'userId', 'isBanned'])
@Check(`"isBanned" = true`)
export class BannedUsersForBlogsEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'character varying', length: 100, nullable: false })
  login: string;

  @Column({ type: 'boolean', nullable: false })
  isBanned: boolean;

  @Column({ type: 'character varying', length: 50, nullable: true })
  banDate: string | null;

  @Column({ type: 'character varying', length: 300, nullable: true })
  banReason: string | null;

  @Column({ type: 'uuid', nullable: false, unique: true })
  blogId: string;

  @Column({ type: 'uuid', nullable: false, unique: true })
  userId: string;

  // @ManyToOne(() => BloggerBlogsEntity, (blog) => blog.bannedUsers)
  // @JoinColumn({ name: 'blogId', referencedColumnName: 'id' })
  // blog: BloggerBlogsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.userId)
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  user: UsersEntity;
}
