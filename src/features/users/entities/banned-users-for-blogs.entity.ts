import {
  Entity,
  Column,
  Unique,
  PrimaryColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { UpdateBanUserDto } from '../../blogger-blogs/dto/update-ban-user.dto';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { UsersEntity } from './users.entity';
import * as uuid4 from 'uuid4';

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

  @ManyToOne(() => BloggerBlogsEntity, (blog) => blog.bannedBlog, {
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

  static createBannedUserEntity(
    user: UsersEntity,
    blog: BloggerBlogsEntity,
    updateBanUserDto: UpdateBanUserDto,
  ): BannedUsersForBlogsEntity {
    const { isBanned, banReason } = updateBanUserDto;

    const bannedUser = new BannedUsersForBlogsEntity();
    bannedUser.id = uuid4().toString();
    bannedUser.isBanned = isBanned;
    bannedUser.banReason = banReason;
    bannedUser.banDate = new Date().toISOString();
    bannedUser.bannedBlog = blog;
    bannedUser.bannedUserForBlogs = user;

    return bannedUser;
  }
}
