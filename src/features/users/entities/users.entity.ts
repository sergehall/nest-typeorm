import { Entity, Column, Unique, PrimaryColumn, OneToMany } from 'typeorm';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';
import { OrgIdEnums } from '../enums/org-id.enums';
import { SecurityDevicesEntity } from '../../security-devices/entities/session-devices.entity';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { PostsEntity } from '../../posts/entities/posts.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { LikeStatusPostsEntity } from '../../posts/entities/like-status-posts.entity';
import { LikeStatusCommentsEntity } from '../../comments/entities/like-status-comments.entity';
import { SentCodesLogEntity } from '../../../mails/infrastructure/entities/sent-codes-log.entity';
import { BannedUsersForBlogsEntity } from './banned-users-for-blogs.entity';

@Entity('Users')
@Unique(['userId', 'login', 'email', 'confirmationCode'])
@Unique(['userId', 'login'])
@Unique(['userId', 'email'])
@Unique(['userId', 'login', 'isBanned'])
export class UsersEntity {
  @PrimaryColumn('uuid', { unique: true, nullable: false })
  userId: string;

  @Column({
    type: 'character varying',
    length: 10,
    nullable: false,
    unique: true,
  })
  login: string;

  @Column({ nullable: false, unique: true })
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

  @Column({ nullable: false, unique: true })
  confirmationCode: string;

  @Column({ nullable: false })
  expirationDate: string;

  @Column({ default: false })
  isConfirmed: boolean;

  @Column({ type: 'character varying', nullable: true, default: null })
  isConfirmedDate: string | null = null;

  @Column({ default: false })
  isBanned: boolean;

  @OneToMany(
    () => SecurityDevicesEntity,
    (securityDevice) => securityDevice.user,
  )
  securityDevices: SecurityDevicesEntity[];

  @OneToMany(() => BloggerBlogsEntity, (bloggerBlogs) => bloggerBlogs.blogOwner)
  bloggerBlogs: BloggerBlogsEntity[];

  @OneToMany(() => PostsEntity, (posts) => posts.postOwner)
  posts: PostsEntity[];

  @OneToMany(() => CommentsEntity, (comments) => comments.commentator)
  comments: CommentsEntity[];

  @OneToMany(
    () => LikeStatusPostsEntity,
    (LikeStatusPosts) => LikeStatusPosts.ratedPostUser,
  )
  ratedPostUser: LikeStatusPostsEntity[];

  @OneToMany(
    () => LikeStatusCommentsEntity,
    (LikeStatusComments) => LikeStatusComments.ratedCommentUser,
  )
  ratedCommentUser: LikeStatusCommentsEntity[];

  @OneToMany(
    () => SentCodesLogEntity,
    (sentCodesLog) => sentCodesLog.sentForUser,
  )
  sentCodeLogs: SentCodesLogEntity[];

  @OneToMany(
    () => BannedUsersForBlogsEntity,
    (bannedBlogs) => bannedBlogs.bannedUserForBlogs,
  )
  bannedBlogsForUser: BannedUsersForBlogsEntity[];
}
