import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';
import { BloggerBlogsEntity } from './blogger-blogs.entity';
import { SubscriptionStatus } from '../enums/subscription-status.enums';

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
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.None,
    nullable: false,
  })
  subscriptionStatus: SubscriptionStatus;

  @Column({ nullable: false, default: false })
  isBanned: boolean;

  @Column({ type: 'character varying', nullable: true })
  banDate: string | null = null;

  @Column({ type: 'character varying', nullable: true })
  banReason: string | null = null;
}
