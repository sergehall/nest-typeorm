import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { BotStatus } from '../enums/bot-status.enum';
import { UsersEntity } from '../../users/entities/users.entity';
import * as uuid4 from 'uuid4';

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

  @Column('numeric', { nullable: false })
  telegramId: number;

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

  static createTelegramBotStatusEntity(
    telegramId: number,
    user: UsersEntity,
    botStatus: BotStatus,
  ): TelegramBotStatusEntity {
    const telegramBotStatusEntity = new TelegramBotStatusEntity();
    telegramBotStatusEntity.id = uuid4();
    telegramBotStatusEntity.telegramId = telegramId;
    telegramBotStatusEntity.user = user;
    telegramBotStatusEntity.botStatus = botStatus;
    telegramBotStatusEntity.createdAt = new Date().toISOString();
    telegramBotStatusEntity.dependencyIsBanned = false;
    telegramBotStatusEntity.isBanned = false;
    telegramBotStatusEntity.banDate = null;
    telegramBotStatusEntity.banReason = null;
    return telegramBotStatusEntity;
  }
}
