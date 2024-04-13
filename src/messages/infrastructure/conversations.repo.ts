import { InjectRepository } from '@nestjs/typeorm';
import { InsertResult, Repository } from 'typeorm';
import { ConversationsEntity } from '../entities/conversations.entity';
import { InternalServerErrorException } from '@nestjs/common';

export class ConversationsRepo {
  constructor(
    @InjectRepository(ConversationsEntity)
    protected conversationsRepository: Repository<ConversationsEntity>,
  ) {}

  async createConversations(
    title: string,
    description: string,
  ): Promise<ConversationsEntity> {
    const conversationsEntity: ConversationsEntity =
      ConversationsEntity.createConversationEntity(title, description);

    try {
      const queryBuilder = this.conversationsRepository
        .createQueryBuilder()
        .insert()
        .into(ConversationsEntity)
        .values(conversationsEntity)
        .returning('*');

      const result: InsertResult = await queryBuilder.execute();
      return result.raw[0];
    } catch (error) {
      console.log(error.message);
      throw new InternalServerErrorException(
        'An error occurred while creating a new conversation.',
      );
    }
  }
}
