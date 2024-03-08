import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BloggerBlogsEntity } from '../../blogger-blogs/entities/blogger-blogs.entity';
import { BlogsSubscribersEntity } from '../../blogger-blogs/entities/blogs-subscribers.entity';
import { BotStatus } from '../enums/bot-status.enum';

@Entity('TelegramBlogsSubscribers')
export class TelegramBlogsSubscribersEntity {
  @PrimaryColumn('uuid', { unique: true, nullable: false })
  id: string;

  @Column({
    type: 'enum',
    enum: BotStatus,
    default: BotStatus.DISABLED,
    nullable: false,
  })
  botStatus: BotStatus;

  @Column('uuid', { nullable: false })
  telegramId: string;

  @Column({ nullable: false })
  createdAt: string;

  @ManyToOne(() => BlogsSubscribersEntity, { eager: true, nullable: false })
  @JoinColumn([
    { name: 'subscriptionStatus', referencedColumnName: 'subscriptionStatus' },
    { name: 'subscriber', referencedColumnName: 'subscriber.subscriberId' },
  ])
  blogSubscriber: BlogsSubscribersEntity;

  @ManyToOne(() => BloggerBlogsEntity, { eager: true, nullable: false })
  @JoinColumn([
    { name: 'blogId', referencedColumnName: 'id' },
    { name: 'blogName', referencedColumnName: 'name' },
  ])
  blog: BloggerBlogsEntity;

  @Column({ default: false, nullable: false })
  dependencyIsBanned: boolean;

  @Column({ nullable: false, default: false })
  isBanned: boolean;

  @Column({ type: 'character varying', nullable: true })
  banDate: string | null = null;

  @Column({ type: 'character varying', nullable: true })
  banReason: string | null = null;
}
