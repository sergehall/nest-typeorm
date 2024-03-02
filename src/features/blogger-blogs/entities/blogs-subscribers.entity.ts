import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';
import { BloggerBlogsEntity } from './blogger-blogs.entity';
import { SubscriptionStatus } from '../enums/subscription-status.enums';
import { CurrentUserDto } from '../../users/dto/current-user.dto';
import * as uuid4 from 'uuid4';

@Entity('BlogsSubscribers')
export class BlogsSubscribersEntity {
  @PrimaryColumn('uuid', { nullable: false })
  id: string;

  @ManyToOne(() => UsersEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'subscriberId', referencedColumnName: 'userId' })
  subscriber: UsersEntity;

  @ManyToOne(() => BloggerBlogsEntity, { eager: true, nullable: false })
  @JoinColumn({ name: 'blogId', referencedColumnName: 'id' })
  blog: BloggerBlogsEntity;

  @Column({
    type: 'character varying',
    length: 50,
    nullable: false,
  })
  createdAt: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.None,
    nullable: false,
  })
  subscriptionStatus: SubscriptionStatus;

  @Column({ default: false, nullable: false })
  dependencyIsBanned: boolean;

  @Column({ nullable: false, default: false })
  isBanned: boolean;

  @Column({ type: 'character varying', nullable: true })
  banDate: string | null = null;

  @Column({ type: 'character varying', nullable: true })
  banReason: string | null = null;

  static createBlogsSubscribersEntity(
    subscriptionStatus: SubscriptionStatus,
    blog: BloggerBlogsEntity,
    currentUserDto: CurrentUserDto,
  ): BlogsSubscribersEntity {
    const user = new UsersEntity();
    user.userId = currentUserDto.userId;

    const subscribersEntity = new BlogsSubscribersEntity();
    subscribersEntity.id = uuid4().toString();
    subscribersEntity.subscriber = user;
    subscribersEntity.blog = blog;
    subscribersEntity.createdAt = new Date().toISOString();
    subscribersEntity.dependencyIsBanned = false;
    subscribersEntity.subscriptionStatus = subscriptionStatus;
    subscribersEntity.isBanned = false;
    subscribersEntity.banDate = null;
    subscribersEntity.banReason = null;

    return subscribersEntity;
  }
}
