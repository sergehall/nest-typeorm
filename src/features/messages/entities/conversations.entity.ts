import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { MessagesEntity } from './messages.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import * as uuid4 from 'uuid4';

@Entity('Conversations')
export class ConversationsEntity {
  @PrimaryColumn('uuid', { unique: true, nullable: false })
  id: string;

  @Column({ type: 'character varying', nullable: false })
  title: string;

  @Column({ type: 'character varying', nullable: false })
  description: string;

  @Column({ nullable: false })
  createdAt: string;

  @Column({ type: 'character varying', nullable: true, default: null })
  updatedAt: string | null = null;

  @Column({ default: false })
  isBanned: boolean;

  @Column({ type: 'character varying', nullable: true, default: null })
  banDate: string | null = null;

  @Column({ type: 'character varying', nullable: true, default: null })
  banReason: string | null = null;

  @OneToMany(() => MessagesEntity, (message) => message.conversation)
  messages: MessagesEntity[];

  @OneToMany(() => UsersEntity, (user) => user.conversations)
  authors: UsersEntity[];

  static createConversationEntity(
    title: string,
    description: string,
  ): ConversationsEntity {
    const conversationEntity = new ConversationsEntity();
    conversationEntity.id = uuid4().toString();
    conversationEntity.title = title;
    conversationEntity.description = description;
    conversationEntity.createdAt = new Date().toISOString();
    conversationEntity.updatedAt = null;
    conversationEntity.isBanned = false;
    conversationEntity.banDate = null;
    conversationEntity.banReason = null;
    return conversationEntity;
  }
}
