import { Entity, Column, Unique, PrimaryColumn, OneToMany } from 'typeorm';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';
import { OrgIdEnums } from '../enums/org-id.enums';
import { SecurityDevicesEntity } from '../../security-devices/entities/session-devices.entity';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { PostsEntity } from '../../posts/entities/posts.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { LikeStatusPostsEntity } from '../../posts/entities/like-status-posts.entity';
import { LikeStatusCommentsEntity } from '../../comments/entities/like-status-comments.entity';
import { SentCodesLogEntity } from '../../../common/mails/infrastructure/entities/sent-codes-log.entity';
import { BannedUsersForBlogsEntity } from './banned-users-for-blogs.entity';
import { PairsGameEntity } from '../../pair-game-quiz/entities/pairs-game.entity';
import { ChallengeAnswersEntity } from '../../pair-game-quiz/entities/challenge-answers.entity';
import { DataForCreateUserDto } from '../dto/data-for-create-user.dto';
import * as uuid4 from 'uuid4';

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

  // @Column({ type: 'date', nullable: true })
  // dob: Date | null;

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

  @OneToMany(() => PairsGameEntity, (pair) => pair.firstPlayer)
  firstPlayer: PairsGameEntity[];

  @OneToMany(() => PairsGameEntity, (pair) => pair.secondPlayer)
  secondPlayer: PairsGameEntity[];

  @OneToMany(() => ChallengeAnswersEntity, (answer) => answer.answerOwner)
  answerOwner: ChallengeAnswersEntity[];

  events: any[] = [];

  static createUserEntity(dto: DataForCreateUserDto): UsersEntity {
    const { login, email, passwordHash, expirationDate } = dto;

    const user: UsersEntity = new UsersEntity();
    user.userId = uuid4();
    user.login = login.toLowerCase();
    user.email = email.toLowerCase();
    user.passwordHash = passwordHash;
    user.createdAt = new Date().toISOString();
    user.orgId = OrgIdEnums.IT_INCUBATOR;
    user.roles = [UserRolesEnums.USER];
    user.isBanned = false;
    user.banDate = null;
    user.banReason = null;
    user.confirmationCode = uuid4();
    user.expirationDate = expirationDate;
    user.isConfirmed = false;

    return user;
  }

  static createSaUser(dto: DataForCreateUserDto): UsersEntity {
    const userSaEntity = this.createUserEntity(dto);

    userSaEntity.roles.push(UserRolesEnums.SA);

    return userSaEntity;
  }
}
