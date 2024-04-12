import { Entity, Column, OneToMany, PrimaryColumn } from 'typeorm';
import { MessagesEntity } from './messages.entity';
import { UsersEntity } from '../../features/users/entities/users.entity';
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

  @Column({ nullable: false })
  updatedAt: string;

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
    conversationEntity.updatedAt = new Date().toISOString();
    conversationEntity.messages = []; // Initialize messages array
    // conversationEntity.authors = authors;
    return conversationEntity;
  }
}
