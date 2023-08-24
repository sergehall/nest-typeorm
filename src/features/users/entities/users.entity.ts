import { Entity, Column, Unique, PrimaryColumn, OneToMany } from 'typeorm';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';
import { OrgIdEnums } from '../enums/org-id.enums';
import { SecurityDevicesEntity } from '../../security-devices/entities/session-devices.entity';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { PostsEntity } from '../../posts/entities/posts.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';

@Entity('Users')
@Unique(['userId', 'login', 'email', 'confirmationCode'])
@Unique(['userId', 'login'])
export class UsersEntity {
  @PrimaryColumn('uuid')
  userId: string;

  @Column({
    type: 'character varying',
    length: 10,
    nullable: false,
  })
  login: string;

  @Column({ nullable: false })
  email: string;

  @Column({ nullable: false })
  passwordHash: string;

  @Column({ nullable: false })
  createdAt: string;

  @Column({
    type: 'enum',
    enum: OrgIdEnums,
    default: OrgIdEnums.IT_INCUBATOR,
    nullable: false,
  })
  orgId: OrgIdEnums;

  @Column({
    type: 'enum',
    enum: UserRolesEnums,
    array: true,
    default: [UserRolesEnums.USER],
  })
  roles: UserRolesEnums[];

  @Column({ type: 'character varying', nullable: true, default: null })
  banDate: string | null = null;

  @Column({ type: 'character varying', nullable: true, default: null })
  banReason: string | null = null;

  @Column({ nullable: false })
  confirmationCode: string;

  @Column({ nullable: false })
  expirationDate: string;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column({ type: 'character varying', nullable: true, default: null })
  isConfirmedDate: string | null = null;

  @Column({ nullable: false })
  ip: string;

  @Column({ nullable: false })
  userAgent: string;

  @Column({ default: false })
  isBanned: boolean;

  @OneToMany(
    () => SecurityDevicesEntity,
    (securityDevice) => securityDevice.user,
  )
  securityDevices: SecurityDevicesEntity[];

  @OneToMany(() => BloggerBlogsEntity, (bloggerBlogs) => bloggerBlogs.blogOwner)
  bloggerBlogs: BloggerBlogsEntity[];

  // @OneToMany(() => PostsEntity, (posts) => posts.postOwner)
  // posts: PostsEntity[];
  //
  // @OneToMany(() => CommentsEntity, (comments) => comments.blogOwner)
  // comments: CommentsEntity[];
}
