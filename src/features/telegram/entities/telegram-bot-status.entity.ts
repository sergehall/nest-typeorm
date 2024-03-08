import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BotStatus } from '../enums/bot-status.enum';
import { UsersEntity } from '../../users/entities/users.entity';

@Entity('TelegramBotStatus')
export class TelegramBotStatusEntity {
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

  @ManyToOne(() => UsersEntity, (user) => user.userId, {
    nullable: false,
    eager: true,
  })
  @JoinColumn({ name: 'userId', referencedColumnName: 'userId' })
  user: UsersEntity;

  @Column({ nullable: false })
  createdAt: string;

  @Column({ default: false, nullable: false })
  dependencyIsBanned: boolean;

  @Column({ nullable: false, default: false })
  isBanned: boolean;

  @Column({ type: 'character varying', nullable: true })
  banDate: string | null = null;

  @Column({ type: 'character varying', nullable: true })
  banReason: string | null = null;
}
