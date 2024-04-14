import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { UsersEntity } from '../../users/entities/users.entity';
import { ConversationsEntity } from './conversations.entity';
import * as uuid4 from 'uuid4';

@Entity('Messages')
export class MessagesEntity {
  @PrimaryColumn('uuid', { unique: true, nullable: false })
  id: string;

  @Column({ type: 'character varying', nullable: false })
  message: string;

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

  @ManyToOne(
    () => ConversationsEntity,
    (conversation) => conversation.messages,
    {
      nullable: false,
      eager: true,
    },
  )
  @JoinColumn([{ name: 'conversationId', referencedColumnName: 'id' }])
  conversation: ConversationsEntity;

  @ManyToOne(() => UsersEntity, (user) => user.messages, {
    nullable: false,
    eager: true,
  })
  @JoinColumn([
    { name: 'authorId', referencedColumnName: 'userId' },
    { name: 'authorLogin', referencedColumnName: 'login' },
  ])
  author: UsersEntity;

  static createMessageEntity(
    message: string,
    conversation: ConversationsEntity,
    author: UsersEntity,
  ): MessagesEntity {
    const messageEntity = new MessagesEntity();
    messageEntity.id = uuid4().toString();
    messageEntity.message = message;
    messageEntity.createdAt = new Date().toISOString();
    messageEntity.updatedAt = new Date().toISOString();
    messageEntity.isBanned = false;
    messageEntity.banDate = null;
    messageEntity.banReason = null;
    messageEntity.conversation = conversation;
    messageEntity.author = author;
    return messageEntity;
  }
}
