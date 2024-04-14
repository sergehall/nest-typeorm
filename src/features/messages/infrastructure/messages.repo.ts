import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { MessagesEntity } from '../entities/messages.entity';
import { CreateMessageDto } from '../dto/create-message.dto';
import { ConversationsEntity } from '../entities/conversations.entity';
import { UsersEntity } from '../../users/entities/users.entity';
import { InternalServerErrorException } from '@nestjs/common';

export class MessagesRepo {
  constructor(
    @InjectRepository(MessagesEntity)
    protected messagesRepository: Repository<MessagesEntity>,
  ) {}

  async createMessage(
    message: string,
    conversation: ConversationsEntity,
    author: UsersEntity,
  ): Promise<MessagesEntity> {
    const messageEntity: MessagesEntity = MessagesEntity.createMessageEntity(
      message,
      conversation,
      author,
    );

    try {
      const queryBuilder = this.messagesRepository
        .createQueryBuilder()
        .insert()
        .into(MessagesEntity)
        .values(messageEntity)
        .returning('*');

      const result: InsertResult = await queryBuilder.execute();

      return result.raw[0];
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while creating a new message.',
      );
    }
  }

  async findAll() {
    try {
      return 'This action returns all messages';
    } catch (error) {
      // Handle errors
      throw new Error('Failed to fetch messages');
    }
  }

  async findOne(id: string): Promise<string> {
    try {
      return `This action returns a #${id} message`;
    } catch (error) {
      // Handle errors
      throw new Error(`Failed to fetch message with id ${id}`);
    }
  }

  async update(id: string, updateMessageDto: CreateMessageDto) {
    try {
      return `This action updates a #${id} message`;
    } catch (error) {
      // Handle errors
      throw new Error(`Failed to update message with id ${id}`);
    }
  }

  async remove(id: string): Promise<string> {
    try {
      return `This action removes a #${id} message`;
    } catch (error) {
      // Handle errors
      throw new Error(`Failed to remove message with id ${id}`);
    }
  }
}
