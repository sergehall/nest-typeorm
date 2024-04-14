import { Entity, Column, Unique, PrimaryColumn, OneToMany } from 'typeorm';
import { UserRolesEnums } from '../../../ability/enums/user-roles.enums';
import { OrgIdEnums } from '../enums/org-id.enums';
import { SecurityDevicesEntity } from '../../security-devices/entities/session-devices.entity';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { PostsEntity } from '../../posts/entities/posts.entity';
import { CommentsEntity } from '../../comments/entities/comments.entity';
import { LikeStatusPostsEntity } from '../../posts/entities/like-status-posts.entity';
import { LikeStatusCommentsEntity } from '../../comments/entities/like-status-comments.entity';
import { SentCodesLogEntity } from '../../../common/mails/entities/sent-codes-log.entity';
import { BannedUsersForBlogsEntity } from './banned-users-for-blogs.entity';
import { PairsGameEntity } from '../../pair-game-quiz/entities/pairs-game.entity';
import { ChallengeAnswersEntity } from '../../pair-game-quiz/entities/challenge-answers.entity';
import { DataForCreateUserDto } from '../dto/data-for-create-user.dto';
import * as uuid4 from 'uuid4';
import { ApiProperty } from '@nestjs/swagger';
import { MessagesEntity } from '../../messages/entities/messages.entity';
import { ConversationsEntity } from '../../messages/entities/conversations.entity';

@Entity('Users')
@Unique(['userId', 'login', 'email', 'confirmationCode'])
@Unique(['userId', 'login'])
@Unique(['userId', 'email'])
@Unique(['userId', 'login', 'isBanned'])
export class UsersEntity {
  @ApiProperty({
    type: String,
    example: 'f0f56ed1-a02d-40c6-a7e8-ea5b0f0008fd',
    description: 'User ID',
  })
  @PrimaryColumn('uuid', { unique: true, nullable: false })
  userId: string;

  @ApiProperty({ type: String, example: 'my-login', description: 'User login' })
  @Column({
    type: 'character varying',
    length: 10,
    nullable: false,
    unique: true,
  })
  login: string;

  @ApiProperty({
    type: String,
    example: 'my-email@gmail.com',
    description: 'User email',
  })
  @Column({ nullable: false, unique: true })
  email: string;

  // @Column({ type: 'date', nullable: true })
  // dob: Date | null;

  @ApiProperty({
    type: String,
    example: '$2b$11$Q5d.4g8x26MWQUGRbWclR.jk2q9JQ8Adai1am/9kjFZPgzypzBfV6',
    description: 'User password hash',
  })
  @Column({ nullable: false })
  passwordHash: string;

  @ApiProperty({
    type: String,
    example: '2024-04-05T07:31:32.342Z',
    description: 'User creation date',
  })
  @Column({ nullable: false })
  createdAt: string;

  @ApiProperty({
    type: String,
    example: 'It-Incubator',
    description: 'User organization ID',
  })
  @Column({
    type: 'enum',
    enum: OrgIdEnums,
    default: OrgIdEnums.IT_INCUBATOR,
    nullable: false,
  })
  orgId: OrgIdEnums;

  @ApiProperty({ type: [String], example: '{user}', description: 'User roles' })
  @Column({
    type: 'enum',
    enum: UserRolesEnums,
    array: true,
    default: [UserRolesEnums.USER],
  })
  roles: UserRolesEnums[];

  @ApiProperty({
    type: String,
    example: '4c9135df-1b6e-40f5-8e14-7e6e41cbe642',
    description: 'User confirmation code',
  })
  @Column({ nullable: false, unique: true })
  confirmationCode: string;

  @ApiProperty({
    type: String,
    example: '2024-04-05T07:31:32.342Z',
    description: 'User confirmation expiration date',
  })
  @Column({ nullable: false })
  expirationDate: string;

  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'User confirmation status',
  })
  @Column({ default: false })
  isConfirmed: boolean;

  @ApiProperty({
    type: String,
    example: '2024-04-05T07:31:32.342Z',
    description: 'User confirmed date',
  })
  @Column({ type: 'character varying', nullable: true, default: null })
  isConfirmedDate: string | null = null;

  @ApiProperty({
    type: Boolean,
    example: false,
    description: 'User ban status',
  })
  @Column({ default: false })
  isBanned: boolean;

  @ApiProperty({
    type: String,
    example: '2024-04-05T07:31:32.342Z',
    description: 'User ban date',
  })
  @Column({ type: 'character varying', nullable: true, default: null })
  banDate: string | null = null;

  @ApiProperty({
    type: String,
    example: 'Cheating in the game',
    description: 'User ban reason',
  })
  @Column({ type: 'character varying', nullable: true, default: null })
  banReason: string | null = null;

  @OneToMany(
    () => SecurityDevicesEntity,
    (securityDevice) => securityDevice.user,
  )
  securityDevices: SecurityDevicesEntity[];

  @OneToMany(() => MessagesEntity, (message) => message.author)
  messages: MessagesEntity[];

  @OneToMany(() => ConversationsEntity, (conversation) => conversation.authors)
  conversations: ConversationsEntity[];

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
